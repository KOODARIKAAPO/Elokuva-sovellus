import pool from "../database.js";

export function toPublicAccount(account) {
  if (!account) return null;
  const { id, username, email } = account;
  return { id, username, email };
}

export async function createAccount({ username, email, hashedPassword }) {
  const { rows } = await pool.query(
    `
    INSERT INTO account (username, email, hashedpassword)
    VALUES ($1, $2, $3)
    RETURNING id, username, email
    `,
    [username, email, hashedPassword]
  );

  return rows[0] ?? null;
}

export async function findAccountByUsername(username) {
  if (!username) return null;
  const { rows } = await pool.query(
    `
    SELECT *
    FROM account
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
    `,
    [username]
  );

  return rows[0] ?? null;
}

export async function findAccountByEmail(email) {
  if (!email) return null;
  const { rows } = await pool.query(
    `
    SELECT *
    FROM account
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [email]
  );

  return rows[0] ?? null;
}

export async function findAccountByIdentifier(identifier) {
  if (!identifier) return null;
  const { rows } = await pool.query(
    `
    SELECT *
    FROM account
    WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [identifier]
  );

  return rows[0] ?? null;
}
//käyttäjän etsiminen id:llä
export async function findAccountById(id) {
  if (!id) return null;
  const { rows } = await pool.query(
    `
    SELECT *
    FROM account
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );
  return rows[0] ?? null;
}
//päivitä käyttäjän profiilitiedot (username, email)
export async function updateAccountProfile(id, { username, email }) {
  const fields = [];
  const values = [];
  let index = 1;

  if (username) {
    fields.push(`username = $${index++}`);
    values.push(username);
  }

  if (email) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const { rows } = await pool.query(
    `
    UPDATE account
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
    `,
    values
  );

  return rows[0] ?? null;
}

export async function updateAccountPassword(id, hashedPassword) {
  const { rows } = await pool.query(
    `
    UPDATE account
    SET hashedpassword = $1
    WHERE id = $2
    RETURNING *
    `,
    [hashedPassword, id]
  );
  return rows[0] ?? null;
}

export async function getShareTokenForUser(userId) {
  const { rows } = await pool.query(
    `
    SELECT share_token
    FROM account
    WHERE id = $1
    LIMIT 1
    `,
    [userId]
  );
  return rows[0]?.share_token ?? null;
}

export async function setShareToken(userId, token) {
  const { rows } = await pool.query(
    `
    UPDATE account
    SET share_token = $1
    WHERE id = $2
    RETURNING share_token
    `,
    [token, userId]
  );
  return rows[0]?.share_token ?? null;
}

export async function findAccountByShareToken(token) {
  if (!token) return null;
  const { rows } = await pool.query(
    `
    SELECT id, username, email, share_token
    FROM account
    WHERE share_token = $1
    LIMIT 1
    `,
    [token]
  );
  return rows[0] ?? null;
}

// Poistaa käyttäjän ja kaikki ryhmät, joissa käyttäjä on owner (viestit/arviot voivat säilyä)
export async function deleteAccountAndOwnedGroups(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM groups WHERE owner_id = $1`, [id]);
    const { rowCount } = await client.query(`DELETE FROM account WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return rowCount > 0;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
