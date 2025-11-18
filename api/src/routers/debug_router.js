import express from "express";
import pool from "../database.js";

const router = express.Router();

// ACCOUNT
router.get("/debug/account", async (req, res) => {
  const { rows } = await 

pool.query("SELECT * FROM account");
  res.json(rows);
});

router.get("/debug/account/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM account WHERE id = $1", [id]);
  res.json(rows);
});

// MOVIE
router.get("/debug/movie", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM movie");
  res.json(rows);
});

router.get("/debug/movie/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM movie WHERE id = $1", [id]);
  res.json(rows);
});

// REVIEW
router.get("/debug/review", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM review");
  res.json(rows);
});

router.get("/debug/review/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM review WHERE id = $1", [id]);
  res.json(rows);
});

// GROUPS
router.get("/debug/groups", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM groups");
  res.json(rows);
});

router.get("/debug/groups/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM groups WHERE id = $1", [id]);
  res.json(rows);
});

// GROUP_MESSAGE
router.get("/debug/group-message", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM group_message");
  res.json(rows);
});

// GROUP_MEMBER
router.get("/debug/group-member", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM group_member");
  res.json(rows);
});

// GROUP_LIST
router.get("/debug/group-list", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM group_list");
  res.json(rows);
});

// GROUP_LIST_ITEM
router.get("/debug/group-list-item", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM group_list_item");
  res.json(rows);
});

// GROUP_FAVOURITE
router.get("/debug/group-favourite", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM group_favourite");
  res.json(rows);
});

// FAVOURITE_LIST
router.get("/debug/favourite-list", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM favourite_list");
  res.json(rows);
});

// FAVOURITE_LIST_ITEM
router.get("/debug/favourite-list-item", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM favourite_list_item");
  res.json(rows);
});

// USER_FAVOURITE
router.get("/debug/user-favourite", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM user_favourite");
  res.json(rows);
});

// Käyttäjän suosikit + elokuvat joinilla
router.get("/debug/user/:userId/favourites-with-movies", async (req, res) => {
  const { userId } = req.params;
  const { rows } = await pool.query(
    `
    SELECT uf.user_id, m.*
    FROM user_favourite uf
    JOIN movie m ON m.id = uf.movie_id
    WHERE uf.user_id = $1
    `,
    [userId]
  );
  res.json(rows);
});

export default router;