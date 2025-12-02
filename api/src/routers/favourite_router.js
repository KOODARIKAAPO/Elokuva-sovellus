// src/routers/favourite_router.js
import { Router } from "express";
import crypto from "crypto";
import { authRequired } from "../middleware/auth_middleware.js";
import {
  addUserFavourite,
  getUserFavourites,
  removeUserFavourite,
} from "../models/favourite_model.js";
import {
  findAccountByShareToken,
  getShareTokenForUser,
  setShareToken,
} from "../models/account_model.js";

const favouriteRouter = Router();

// Julkinen: hae jaettu suosikkilista tokenilla
favouriteRouter.get("/shared/:token", async (req, res, next) => {
  try {
    const token = req.params.token?.trim();
    if (!token) return res.status(400).json({ error: "Share token is required" });

    const owner = await findAccountByShareToken(token);
    if (!owner) return res.status(404).json({ error: "Share link not found" });

    const favourites = await getUserFavourites(owner.id);
    return res.json({
      owner: { id: owner.id, username: owner.username },
      favourites,
    });
  } catch (err) {
    return next(err);
  }
});

// Kaikki /favourites -reitit vaatii kirjautumisen
favouriteRouter.use(authRequired);

// POST /favourites/share
// -> palauttaa olemassa olevan tai luo uuden tokenin
favouriteRouter.post("/share", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const regenerate = Boolean(req.body?.regenerate);

    let token = await getShareTokenForUser(userId);
    if (!token || regenerate) {
      token = crypto.randomBytes(24).toString("hex");
      token = await setShareToken(userId, token);
    }

    if (!token) return res.status(500).json({ error: "Share token creation failed" });

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

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
