import pool from "../database.js";

export async function listGroups(req, res, next) {
  try {
    const { rows } = await pool.query("SELECT * FROM groups ORDER BY id ASC");
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

// Ryhmän luominen
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

// Ryhmän poistaminen
export async function deleteGroup(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const userId = req.user.id;

    // Tarkista omistus
    const { rows } = await pool.query(
      "SELECT * FROM groups WHERE id = $1",
      [groupId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = rows[0];

    if (group.owner_id !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await pool.query("DELETE FROM groups WHERE id = $1", [groupId]);

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}

export async function getGroupById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const { rows } = await pool.query(
      "SELECT * FROM groups WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

export default {
  listGroups,
  createGroup,
  deleteGroup,
  getGroupById,
};