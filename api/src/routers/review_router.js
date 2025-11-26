import express from 'express';
import { ReviewController } from '../controllers/review_controller.js';
import { authRequired } from '../middleware/auth_middleware.js';

const router = express.Router();

// Luo uusi arvostelu (vain kirjautuneille)
router.post('/', authRequired, ReviewController.createReview);

// Hae käyttäjän omat arvostelut
router.get('/me', authRequired, ReviewController.getUserReviews);

// Päivitä arvostelu
router.put('/:id', authRequired, ReviewController.updateReview);

// Poista arvostelu
router.delete('/:id', authRequired, ReviewController.deleteReview);

export default router;
