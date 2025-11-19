import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log("TMDB KEY →", API_KEY);

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function MovieCarousel() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (!API_KEY) {
      console.error("TMDB API KEY puuttuu! Lisää se .env tiedostoon.");
      return;
    }

    fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
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
    <div style={{ width: "100%", padding: "20px 0" }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={5}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <img
              src={IMG_BASE + movie.poster_path}
              alt={movie.title}
              style={{ width: "100%", borderRadius: "8px" }}
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
