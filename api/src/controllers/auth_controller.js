import {
  createAccount,
  findAccountByEmail,
  findAccountByIdentifier,
  findAccountByUsername,
  toPublicAccount,
} from "../models/account_model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const MIN_PASSWORD_LENGTH = 8;

export async function register(req, res, next) {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username should be at least 3 characters long" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `Password should be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createAccount({ username, email, hashedPassword });

    if (!user) {
      return res.status(500).json({ error: "Failed to create account" });
    }

    return res.status(201).json({ message: "Account created successfully", user });
  } catch (err) {
    if (err.code === "23505") {
      let error = "Account with the same username or email already exists";
      if (err.detail?.includes("username")) {
        error = "Username is already taken";
      } else if (err.detail?.includes("email")) {
        error = "Email is already registered";
      }
      return res.status(409).json({ error });
    }
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const identifier =
      typeof req.body.identifier === "string" ? req.body.identifier.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const searchValue = username || email || identifier;

    if (!searchValue || !password) {
      return res.status(400).json({ error: "Username/email and password are required" });
    }

    const account = username
      ? await findAccountByUsername(username)
      : email
      ? await findAccountByEmail(email)
      : await findAccountByIdentifier(identifier);

    if (!account) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await verifyPassword(password, account.hashedpassword);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ message: "Login successful", user: toPublicAccount(account) });
  } catch (err) {
    return next(err);
  }
}
