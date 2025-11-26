import { Router } from "express";
import { deleteMe, getMe, login, register, updatePassword, updateProfile } from "../controllers/auth_controller.js";
import { authRequired } from "../middleware/auth_middleware.js";

const authRouter = Router();

// Rekisteröinti
authRouter.post("/register", register);

// Kirjautuminen (palauttaa user + token)
authRouter.post("/login", login);

// Tokenin tarkistus + kirjautuneen käyttäjän tiedot
authRouter.get("/me", authRequired, getMe);

// Profiilin päivitys (username/email)
authRouter.patch("/me", authRequired, updateProfile);

// Salasanan vaihto
authRouter.patch("/me/password", authRequired, updatePassword);

// Tilin poisto
authRouter.delete("/me", authRequired, deleteMe);

export default authRouter;
