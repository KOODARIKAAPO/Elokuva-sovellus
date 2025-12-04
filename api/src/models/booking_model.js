import pool from '../database.js';

const BookingModel = {
  async getScreenings() {
    const query = `
      SELECT screening_date, tmdb_id, seats
      FROM booking
      WHERE screening_date >= CURRENT_DATE
      ORDER BY screening_date ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getUserBookings(user_id) {
    const query = `
      SELECT *
      FROM booking
      WHERE user_id = $1
      ORDER BY screening_date ASC;
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  },

  async createBooking(user_id, tmdb_id, screening_date, seats) {
    const query = `
      INSERT INTO booking (user_id, tmdb_id, screening_date, seats)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user_id, tmdb_id, screening_date, seats];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteBooking(id) {
    const query = `
      DELETE FROM booking
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

export default BookingModel;
