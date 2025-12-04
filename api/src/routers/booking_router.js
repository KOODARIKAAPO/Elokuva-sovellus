import express from 'express';
import { BookingController } from '../controllers/booking_controller.js';
import { authRequired } from '../middleware/auth_middleware.js';

const router = express.Router();

// Hae tulevat näytökset ja varatut paikat (ei vaadi kirjautumista)
router.get('/screenings', BookingController.getScreenings);

// Hae omat varaukset (vaatii kirjautumisen)
router.get('/me', authRequired, BookingController.getUserBookings);

// Luo varaus
router.post('/', authRequired, BookingController.createBooking);

// Poista varaus
router.delete('/:id', authRequired, BookingController.deleteBooking);

export default router;
