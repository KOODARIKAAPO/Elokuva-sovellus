import BookingModel from '../models/booking_model.js';

export const BookingController = {
 
  getScreenings: async (req, res) => {
    try {
      const screenings = await BookingModel.getScreenings();
      res.status(200).json(screenings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Näytösten haku epäonnistui' });
    }
  },


  getUserBookings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const bookings = await BookingModel.getUserBookings(user_id);
      res.status(200).json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Omien varausten haku epäonnistui' });
    }
  },


  createBooking: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { tmdb_id, screening_date, seats } = req.body;

      if (!tmdb_id || !screening_date || !seats || !Array.isArray(seats)) {
        return res.status(400).json({ message: 'Pakolliset tiedot puuttuvat tai väärässä muodossa' });
      }

      const booking = await BookingModel.createBooking(user_id, tmdb_id, screening_date, seats);
      res.status(201).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Varaus epäonnistui' });
    }
  },


  deleteBooking: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { id } = req.params;

     
      const userBookings = await BookingModel.getUserBookings(user_id);
      const booking = userBookings.find(b => b.id === parseInt(id));
      if (!booking) {
        return res.status(403).json({ message: 'Et voi poistaa toisen käyttäjän varausta' });
      }

      const deleted = await BookingModel.deleteBooking(id);
      res.status(200).json({ message: 'Varaus poistettu', booking: deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Varausten poisto epäonnistui' });
    }
  },
};
