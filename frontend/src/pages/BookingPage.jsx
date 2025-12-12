import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import "./BookingPage.css";

export function BookingPage() {
  const { currentUser } = useAuth();

  // Mock dataa
  const mockScreenings = [
    {
      id: 17,
      title: "John Wick: Chapter 4",
      poster: "https://image.tmdb.org/t/p/w200/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
      date: "2025-12-17",
      time: "18:00",
      seatsTaken: [4, 7, 11, 20, 25, 31],
    },
    {
      id: 4,
      title: "Wonka",
      poster: "https://image.tmdb.org/t/p/w200/qhb1qOilapbapxWQn9jtRCMwXJF.jpg",
      date: "2025-12-18",
      time: "20:00",
      seatsTaken: [6, 7, 13, 14, 20, 31],
    },
    {
      id: 5,
      title: "Guardians of the Galaxy Vol. 3",
      poster: "https://image.tmdb.org/t/p/w200/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
      date: "2025-12-19",
      time: "18:30",
      seatsTaken: [4, 5, 18, 22, 23, 30],
    },
    {
      id: 6,
      title: "Barbie",
      poster: "https://image.tmdb.org/t/p/w200/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      date: "2025-12-20",
      time: "19:00",
      seatsTaken: [1, 3, 10, 11, 17, 26],
    },
    {
      id: 7,
      title: "The Batman",
      poster: "https://image.tmdb.org/t/p/w200/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      date: "2025-12-21",
      time: "21:00",
      seatsTaken: [2, 6, 15, 19, 24, 32],
    }
  ];


  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [bookings, setBookings] = useState([]);

  const ROWS = 5;
  const COLS = 10;

  // Lataa varaukset localStoragesta ja suodatetaan käyttäjäkohtaisesti
  useEffect(() => {
    const savedBookings = localStorage.getItem("bookings");
    if (savedBookings) {
      const allBookings = JSON.parse(savedBookings);
      if (currentUser) {
        setBookings(
          allBookings.filter((b) => b.userId === currentUser.id)
        );
      } else {
        setBookings([]);
      }
    }
    setScreenings(mockScreenings);
  }, [currentUser]);

  // Päivitetään penkkikartta valitun näytöksen mukaan
  useEffect(() => {
    if (!selectedScreening) return;

    const seats = [];
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const takenSeats = [
      ...selectedScreening.seatsTaken,
      ...savedBookings
        .filter((b) => b.screening.id === selectedScreening.id)
        .flatMap((b) => b.seats.map((s) => s - 1)),
    ];

    for (let i = 0; i < ROWS * COLS; i++) {
      seats.push(takenSeats.includes(i) ? "taken" : "available");
    }

    setSeatMap(seats);
    setSelectedSeats([]);
  }, [selectedScreening, bookings]);

  function toggleSeat(index) {
    if (!currentUser) {
      alert("Paikkojen varaaminen vaatii kirjautumisen!");
      return;
    }
    if (seatMap[index] === "taken") return;

    if (selectedSeats.includes(index)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== index));
    } else {
      setSelectedSeats([...selectedSeats, index]);
    }
  }

  function confirmBooking() {
    if (!currentUser) {
      alert("Kirjaudu ensin varataksesi paikat!");
      return;
    }
    if (!selectedScreening || selectedSeats.length === 0) {
      alert("Valitse näytös ja vähintään yksi paikka!");
      return;
    }

    const newBooking = {
      userId: currentUser.id,
      screening: selectedScreening,
      seats: selectedSeats.map((s) => s + 1),
    };

    // Päivitä localStorageen
    const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const updatedAllBookings = [...allBookings, newBooking];
    localStorage.setItem("bookings", JSON.stringify(updatedAllBookings));

    // Päivitä käyttäjän omat varaukset
    setBookings((prev) => [...prev, newBooking]);

    setSelectedSeats([]);
    alert("Paikat varattu onnistuneesti!");
  }

  function cancelBooking(index) {
    const bookingToCancel = bookings[index];
    if (!bookingToCancel) return;

    if (
      window.confirm(
        `Haluatko varmasti perua varauksen: ${bookingToCancel.screening.title}, paikat: ${bookingToCancel.seats.join(", ")}?`
      )
    ) {
      // Poistetaan localStoragesta
      const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      const updatedAllBookings = allBookings.filter(
        (b, i) =>
          !(
            b.userId === bookingToCancel.userId &&
            b.screening.id === bookingToCancel.screening.id &&
            JSON.stringify(b.seats) === JSON.stringify(bookingToCancel.seats)
          )
      );
      localStorage.setItem("bookings", JSON.stringify(updatedAllBookings));

      // Päivitä käyttäjän omat varaukset
      setBookings(bookings.filter((_, i) => i !== index));

      alert("Varaus peruttu!");
    }
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Varaa paikat</h1>
        <p className="hint">Valitse näytös, katso salin kartta ja varaa paikat yhdellä napilla.</p>
      </header>

      <section className="card booking-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Näytökset</p>
            <h2>Valitse elokuva</h2>
          </div>
        </div>
        {screenings.length === 0 ? (
          <p className="hint">Ei näytöksiä tällä hetkellä.</p>
        ) : (
          <div className="screenings-grid">
            {screenings.map((s) => (
              <article
                key={s.id}
                onClick={() => setSelectedScreening(s)}
                className={`screening-card ${selectedScreening?.id === s.id ? "selected" : ""}`}
              >
                <img src={s.poster} alt={s.title} />
                <div className="screening-copy">
                  <h3>{s.title}</h3>
                  <p className="screening-meta">
                    {s.date} {s.time}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>


      {selectedScreening && (
        <section className="card booking-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Salikartta</p>
              <h2>Valitse paikat</h2>
              <p className="hint">
                {selectedScreening.title} — {selectedScreening.date} {selectedScreening.time}
              </p>
            </div>
          </div>
          <div className="seat-layout">
            <div className="seat-stage">
              <div className="screen-label">Valkokangas</div>
              <div className="seat-grid-shell">
                <div className="seat-grid" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(36px, 1fr))` }}>
                  {seatMap.map((seat, index) => {
                    const status =
                      seat === "taken"
                        ? "taken"
                        : selectedSeats.includes(index)
                          ? "selected"
                          : "available";

                    return (
                      <div
                        key={index}
                        onClick={() => toggleSeat(index)}
                        className={`seat ${status}`}
                        role="button"
                        aria-pressed={selectedSeats.includes(index)}
                        aria-label={`Paikka ${index + 1}${status === "taken" ? " (varattu)" : ""}`}
                      >
                        {index + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="seat-legend">
                <div className="legend-item">
                  <span className="legend-swatch available" /> Vapaa
                </div>
                <div className="legend-item">
                  <span className="legend-swatch selected" /> Valittu
                </div>
                <div className="legend-item">
                  <span className="legend-swatch taken" /> Varattu
                </div>
              </div>
            </div>

            <div className="seat-summary">
              <h3>Valitut paikat</h3>
              {selectedSeats.length === 0 ? (
                <p className="hint">Ei valittuja paikkoja.</p>
              ) : (
                <ul>
                  {selectedSeats.map((s) => (
                    <li key={s}>Paikka {s + 1}</li>
                  ))}
                </ul>
              )}
              <button onClick={confirmBooking}>Varaa paikat</button>
            </div>
          </div>
        </section>
      )}


      <section className="card booking-section">
        <h2>Omat varaukset</h2>
        {!currentUser ? (
          <p>Kirjaudu nähdäksesi omat varauksesi.</p>
        ) : bookings.length === 0 ? (
          <p>Sinulla ei ole varauksia.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((b, idx) => (
              <div
                key={idx}
                className="booking-row"
              >
                <div className="booking-row__copy">
                  <p>
                    {b.screening.title} - {b.screening.date} {b.screening.time}
                  </p>
                  <p>Paikat: {b.seats.join(", ")}</p>
                </div>
                <button onClick={() => cancelBooking(idx)}>
                  Peru varaus
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
