import pool from "../database.js";

export async function getGroupMessages(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const userId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const groupCheck = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isOwner = userId === groupCheck.rows[0].owner_id;

    const memberCheck = await pool.query(
      "SELECT role FROM group_member WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );

    if (!isOwner && memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const { rows } = await pool.query(
      `SELECT gm.id, gm.message_text, gm.sent_at, gm.sender_id, 
              a.username as sender_name
       FROM group_message gm
       JOIN account a ON a.id = gm.sender_id
       WHERE gm.group_id = $1
       ORDER BY gm.sent_at ASC`,
      [groupId]
    );

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function sendGroupMessage(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const userId = req.user.id;
    const messageText = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!groupId) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    if (!messageText) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const groupCheck = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isOwner = userId === groupCheck.rows[0].owner_id;

    const memberCheck = await pool.query(
      "SELECT role FROM group_member WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );

    if (!isOwner && memberCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const { rows } = await pool.query(
      `INSERT INTO group_message (group_id, sender_id, message_text)
       VALUES ($1, $2, $3)
       RETURNING id, group_id, sender_id, message_text, sent_at`,
      [groupId, userId, messageText]
    );

    const message = rows[0];
    const { rows: senderRows } = await pool.query(
      "SELECT username FROM account WHERE id = $1",
      [userId]
    );

    return res.status(201).json({
      ...message,
      sender_name: senderRows[0].username
    });
  } catch (err) {
    return next(err);
  }
}

export async function deleteGroupMessage(req, res, next) {
  try {
    const groupId = Number(req.params.id);
    const messageId = Number(req.params.messageId);
    const userId = req.user.id;

    if (!groupId || !messageId) {
      return res.status(400).json({ error: "Group ID and message ID are required" });
    }

    const messageCheck = await pool.query(
      "SELECT sender_id FROM group_message WHERE id = $1 AND group_id = $2",
      [messageId, groupId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const isSender = userId === messageCheck.rows[0].sender_id;

    const groupCheck = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    const isOwner = userId === groupCheck.rows[0].owner_id;

    if (!isSender && !isOwner) {
      return res.status(403).json({ error: "You can only delete your own messages or be the group owner" });
    }
    
    await pool.query(
      "DELETE FROM group_message WHERE id = $1",
      [messageId]
    );

    return res.json({ message: "Message deleted successfully" });
  } catch (err) {
    return next(err);
  }
}

export default {
  getGroupMessages,
  sendGroupMessage,
  deleteGroupMessage,
};
