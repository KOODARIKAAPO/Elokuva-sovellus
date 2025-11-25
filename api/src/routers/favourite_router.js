// src/routers/favourite_router.js
import { Router } from "express";
import { authRequired } from "../middleware/auth_middleware.js";
import {
  addUserFavourite,
  getUserFavourites,
  removeUserFavourite,
} from "../models/favourite_model.js";

const favouriteRouter = Router();

// Kaikki /favourites -reitit vaatii kirjautumisen
favouriteRouter.use(authRequired);

// GET /favourites
// -> palauttaa kirjautuneen käyttäjän suosikit
favouriteRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id; // tulee JWT:stä
    const favourites = await getUserFavourites(userId);
    return res.json({ userId, favourites });
  } catch (err) {
    return next(err);
  }
});

// POST /favourites
// body: { tmdbId }
favouriteRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.body.tmdbId);

    if (!tmdbId) {
      return res.status(400).json({ error: "tmdbId is required" });
    }

    const fav = await addUserFavourite(userId, tmdbId);
    return res.status(201).json({ message: "Favourite added", favourite: fav });
  } catch (err) {
    return next(err);
  }
});

// DELETE /favourites/:tmdbId
favouriteRouter.delete("/:tmdbId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tmdbId = Number(req.params.tmdbId);

    if (!tmdbId) {
      return res.status(400).json({ error: "tmdbId is required" });
    }

    const removed = await removeUserFavourite(userId, tmdbId);
    if (!removed) {
      return res.status(404).json({ error: "Favourite not found" });
    }

    return res.json({ message: "Favourite removed" });
  } catch (err) {
    return next(err);
  }
});

export default favouriteRouter;
