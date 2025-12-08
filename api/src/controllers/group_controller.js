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
    const owner_id = req.user.id;
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

// Hae käyttäjän liittymät ryhmät
export async function getJoinedGroups(req, res, next) {
   console.log("req.user:", req.user);
   const userId = req.user?.id;
   if (!userId) return res.status(400).json({ error: "No user ID" });

  try {
    const { rows } = await pool.query(`
      SELECT g.*
      FROM groups g
      JOIN group_member gm ON g.id = gm.group_id
      WHERE gm.user_id = $1 AND gm.status = 'approved'
    `, [userId]);

    return res.json(rows);
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

export async function getGroupFavourites(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    if (!groupId) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const { rows } = await pool.query(
      "SELECT tmdb_id, created_at FROM group_favourite WHERE group_id = $1 ORDER BY created_at DESC",
      [groupId]
    );

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function addMovieToGroup(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const tmdbId = Number(req.body.tmdbId);
    const userId = req.user.id;

    if (!groupId || !tmdbId) {
      return res.status(400).json({ error: "Group ID and tmdbId are required" });
    }

    // Check if group exists and get owner_id
    const groupCheck = await pool.query(
      "SELECT id, owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupOwnerId = groupCheck.rows[0].owner_id;

    // Check if user is owner of the group or a member
    const memberCheck = await pool.query(
      "SELECT role FROM group_member WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );

    // Allow if user is group owner OR is a member/admin
    const isOwner = userId === groupOwnerId;
    const isMember = memberCheck.rows.length > 0;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Insert or ignore if already exists
    const { rows } = await pool.query(
      "INSERT INTO group_favourite (group_id, tmdb_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [groupId, tmdbId]
    );

    if (rows.length === 0) {
      return res.status(409).json({ message: "Movie already in group favourites" });
    }

    return res.status(201).json({ message: "Movie added to group", favourite: rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function removeMovieFromGroup(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const tmdbId = Number(req.params.tmdbId);
    const userId = req.user.id;

    if (!groupId || !tmdbId) {
      return res.status(400).json({ error: "Group ID and tmdbId are required" });
    }

    // Check if group exists and get owner_id
    const groupCheck = await pool.query(
      "SELECT id, owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupOwnerId = groupCheck.rows[0].owner_id;

    // Check if user is owner of the group or a member
    const memberCheck = await pool.query(
      "SELECT role FROM group_member WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );

    // Allow if user is group owner OR is a member
    const isOwner = userId === groupOwnerId;
    const isMember = memberCheck.rows.length > 0;

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const { rows } = await pool.query(
      "DELETE FROM group_favourite WHERE group_id = $1 AND tmdb_id = $2 RETURNING *",
      [groupId, tmdbId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found in group favourites" });
    }

    return res.json({ message: "Movie removed from group", favourite: rows[0] });
  } catch (err) {
    return next(err);
  }
}

// Listaa ryhmän jäsenet
export async function listGroupMembers(req, res, next) {
  try {
    const groupId = Number(req.params.id);

    const { rows } = await pool.query(
      "SELECT * FROM group_member WHERE group_id = $1",
      [groupId]
    );

    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Lähetä liittymispyyntö ryhmään
export async function requestJoin(req, res) {
  const groupId = Number(req.params.id);
  const userId = req.user.id;

  const { rows } = await pool.query(
    "SELECT * FROM group_member WHERE group_id = $1 AND user_id = $2",
    [groupId, userId]
  );

  if (rows.length > 0) {
    return res.json({ message: "Already pending or member" });
  }

  const result = await pool.query(
    "INSERT INTO group_member (group_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *",
    [groupId, userId]
  );

  return res.json(result.rows[0]);
}

// Hyväksy jäsenyyspyyntö
export async function approveMember(req, res) {
  const groupId = Number(req.params.id);
  const userId = Number(req.params.userId);

  const group = await pool.query("SELECT * FROM groups WHERE id = $1", [groupId]);

  if (group.rows[0].owner_id !== req.user.id) {
    return res.status(403).json({ error: "Not allowed" });
  }

  await pool.query(
    "UPDATE group_member SET status = 'approved' WHERE group_id = $1 AND user_id = $2",
    [groupId, userId]
  );

  return res.json({ success: true });
}

// Poistu ryhmästä
export async function leaveGroup(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const userId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const groupRes = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupRes.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Omistaja ei voi poistua – hänen pitää poistaa ryhmä
    if (groupRes.rows[0].owner_id === userId) {
      return res.status(403).json({ error: "Owner cannot leave their own group" });
    }

    const result = await pool.query(
      "DELETE FROM group_member WHERE group_id = $1 AND user_id = $2 RETURNING *",
      [groupId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }

    return res.json({ success: true, message: "Left group successfully" });
  } catch (err) {
    next(err);
  }
}



export default {
  listGroups,
  createGroup,
  deleteGroup,
  getGroupById,
  getGroupFavourites,
  addMovieToGroup,
  removeMovieFromGroup,
  listGroupMembers,
  requestJoin,
  approveMember,
  getJoinedGroups,
  leaveGroup,
};