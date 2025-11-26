import pool from "../database.js";

export async function listGroups(req, res, next) {
  try {
    const { rows } = await pool.query("SELECT * FROM groups ORDER BY id ASC");
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function createGroup(req, res, next) {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const owner_id = Number(req.body.owner_id) || null;
    const password = typeof req.body.password === "string" ? req.body.password : null;

    if (!name || !owner_id) {
      return res.status(400).json({ error: "name and owner_id are required" });
    }

    const { rows } = await pool.query(
      "INSERT INTO groups (name, owner_id, password) VALUES ($1, $2, $3) RETURNING *",
      [name, owner_id, password]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

export default {
  listGroups,
  createGroup,
};