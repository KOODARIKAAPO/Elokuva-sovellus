// api/src/controllers/review_controller.js
import ReviewModel from '../models/review_model.js';

export const ReviewController = {
  // Luo uusi arvostelu
  createReview: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { tmdb_id, rating, review_text } = req.body;

      if (!tmdb_id || !rating) {
        return res.status(400).json({ message: 'tmdb_id ja rating ovat pakollisia' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating pitää olla 1-5' });
      }

      const review = await ReviewModel.createReview(user_id, tmdb_id, rating, review_text || '');
      res.status(201).json(review);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ message: 'Olet jo arvostellut tämän elokuvan' });
      }
      console.error(err);
      res.status(500).json({ message: 'Arvostelun luonti epäonnistui' });
    }
  },

  // Hae kirjautuneen käyttäjän omat arvostelut
  getUserReviews: async (req, res) => {
    try {
      const user_id = req.user.id;
      const reviews = await ReviewModel.getUserReviews(user_id);
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Arvosteluiden haku epäonnistui' });
    }
  },

  // Päivitä arvostelu
  updateReview: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { id } = req.params;
      const { rating, review_text } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating pitää olla 1-5' });
      }

      const userReviews = await ReviewModel.getUserReviews(user_id);
      const review = userReviews.find(r => r.id === parseInt(id));
      if (!review) {
        return res.status(403).json({ message: 'Et voi muokata toisen käyttäjän arvostelua' });
      }

      const updated = await ReviewModel.updateReview(id, rating, review_text || '');
      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Arvostelun päivitys epäonnistui' });
    }
  },

  // Poista arvostelu
  deleteReview: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { id } = req.params;

      const userReviews = await ReviewModel.getUserReviews(user_id);
      const review = userReviews.find(r => r.id === parseInt(id));
      if (!review) {
        return res.status(403).json({ message: 'Et voi poistaa toisen käyttäjän arvostelua' });
      }

      const deleted = await ReviewModel.deleteReview(id);
      res.status(200).json({ message: 'Arvostelu poistettu', review: deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Arvostelun poisto epäonnistui' });
    }
  },
};
