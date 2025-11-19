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
