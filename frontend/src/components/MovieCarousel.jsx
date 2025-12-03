import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log("TMDB KEY →", API_KEY);

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function MovieCarousel({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (!API_KEY) {
      console.error("TMDB API KEY puuttuu! Lisää se .env tiedostoon.");
      return;
    }

    fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fi-FI&page=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.results) {
          setMovies(data.results);
        }
      })
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={4}
        breakpoints={{
          0: { slidesPerView: 2.2, spaceBetween: 10 },
          520: { slidesPerView: 2.6, spaceBetween: 12 },
          768: { slidesPerView: 3.4, spaceBetween: 14 },
          1024: { slidesPerView: 4, spaceBetween: 16 },
          1280: { slidesPerView: 4, spaceBetween: 18 },
        }}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <img
              src={IMG_BASE + movie.poster_path}
              alt={movie.title}
              style={{ width: "100%", borderRadius: "8px", cursor: onSelectMovie ? "pointer" : "default" }}
              onClick={() => typeof onSelectMovie === "function" && onSelectMovie(movie)}
            />
            <p style={{ textAlign: "center", marginTop: "8px", fontSize: "14px" }}>
              {movie.title}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default MovieCarousel;
