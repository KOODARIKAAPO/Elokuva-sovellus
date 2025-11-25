// src/models/favourite_model.js
import pool from "../database.js";

// Lisää yksi suosikki (ei duplikaatteja)
export async function addUserFavourite(userId, tmdbId) {
  const sql = `
    INSERT INTO user_favourite (user_id, tmdb_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, tmdb_id) DO NOTHING
    RETURNING user_id, tmdb_id, created_at;
  `;

  const { rows } = await pool.query(sql, [userId, tmdbId]);

  // Jos rivi oli jo olemassa, rows on tyhjä -> haetaan olemassa oleva
  if (rows[0]) return rows[0];

  const { rows: existing } = await pool.query(
    `SELECT user_id, tmdb_id, created_at
     FROM user_favourite
     WHERE user_id = $1 AND tmdb_id = $2`,
    [userId, tmdbId]
  );
  return existing[0] || null;
}

// Poista suosikki
export async function removeUserFavourite(userId, tmdbId) {
  const { rowCount } = await pool.query(
    `DELETE FROM user_favourite WHERE user_id = $1 AND tmdb_id = $2`,
    [userId, tmdbId]
  );
  return rowCount > 0;
}

// Hae kaikki käyttäjän suosikit (vain id:t)
export async function getUserFavourites(userId) {
  const { rows } = await pool.query(
    `SELECT tmdb_id, created_at
     FROM user_favourite
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}
