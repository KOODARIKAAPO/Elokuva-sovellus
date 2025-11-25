import { Router } from "express";
import { login, register } from "../controllers/auth_controller.js";
import { authRequired } from "../middleware/auth_middleware.js";

const authRouter = Router();

// Rekisteröinti
authRouter.post("/register", register);

// Kirjautuminen (palauttaa user + token)
authRouter.post("/login", login);

// Tokenin tarkistus + kirjautuneen käyttäjän tiedot
authRouter.get("/me", authRequired, (req, res) => {
  // req.user tulee JWT-tokenista
  return res.json({ user: req.user });
});

export default authRouter;
