import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";

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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Varaa paikat</h1>

  
      <section style={{ marginBottom: "40px" }}>
        <h2>Näytökset</h2>
        {screenings.length === 0 ? (
          <p>Ei näytöksiä tällä hetkellä.</p>
        ) : (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {screenings.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedScreening(s)}
                style={{
                  cursor: "pointer",
                  border:
                    selectedScreening?.id === s.id
                      ? "2px solid blue"
                      : "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                  textAlign: "center",
                  width: "150px",
                }}
              >
                <img
                  src={s.poster}
                  alt={s.title}
                  style={{ width: "100%", borderRadius: "4px" }}
                />
                <p style={{ fontWeight: "bold" }}>{s.title}</p>
                <p>
                  {s.date} {s.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>


      {selectedScreening && (
        <section style={{ marginBottom: "40px" }}>
          <h2>Valitse paikat</h2>
          <div style={{ display: "flex", gap: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 40px)`,
                gap: "5px",
              }}
            >
              {seatMap.map((seat, index) => {
                let color;
                if (seat === "taken") color = "red";
                else if (selectedSeats.includes(index)) color = "blue";
                else color = "green";

                return (
                  <div
                    key={index}
                    onClick={() => toggleSeat(index)}
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      cursor:
                        seat === "taken" ? "not-allowed" : "pointer",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>


            <div style={{ minWidth: "200px" }}>
              <h3>Valitut paikat</h3>
              {selectedSeats.length === 0 ? (
                <p>Ei valittuja paikkoja.</p>
              ) : (
                <ul>
                  {selectedSeats.map((s) => (
                    <li key={s}>Paikka {s + 1}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={confirmBooking}
                style={{
                  marginTop: "10px",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "darkblue",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Varaa paikat
              </button>
            </div>
          </div>
        </section>
      )}


      <section>
        <h2>Omat varaukset</h2>
        {!currentUser ? (
          <p>Kirjaudu nähdäksesi omat varauksesi.</p>
        ) : bookings.length === 0 ? (
          <p>Sinulla ei ole varauksia.</p>
        ) : (
          <div>
            {bookings.map((b, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold" }}>
                    {b.screening.title} - {b.screening.date} {b.screening.time}
                  </p>
                  <p>Paikat: {b.seats.join(", ")}</p>
                </div>
                <button
                  onClick={() => cancelBooking(idx)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "red",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
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
