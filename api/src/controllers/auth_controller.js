import {
  createAccount,
  findAccountByEmail,
  findAccountByIdentifier,
  findAccountByUsername,
  findAccountById,
  deleteAccountAndOwnedGroups,
  updateAccountProfile,
  updateAccountPassword,
  toPublicAccount,
} from "../models/account_model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import jwt from 'jsonwebtoken';

const MIN_PASSWORD_LENGTH = 8;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

//Functio joka luo JWT tokenin
function createToken(account) {
  const payload = {
    id: account.id,
    username: account.username,
    email: account.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
//Rekisteröitymisen käsittelijä
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
//Kirjautumisen käsittelijä luo tokenin
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

    const user = toPublicAccount(account);
    const token = createToken(user);

    return res.json({ message: "Login successful", user, token });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const account = await findAccountById(req.user.id);
    if (!account) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: toPublicAccount(account) });
  } catch (err) {
    return next(err);
  }
}
//Käyttäjäprofiilin päivityksen käsittelijä luo tokenin
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!username && !email) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    if (username && username.length < 3) {
      return res.status(400).json({ error: "Username should be at least 3 characters long" });
    }

    if (email && !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    const updated = await updateAccountProfile(userId, {
      username: username || undefined,
      email: email || undefined,
    });

    if (!updated) {
      return res.status(400).json({ error: "Update failed" });
    }

    const user = toPublicAccount(updated);
    const token = createToken(user);
    return res.json({ message: "Account updated", user, token });
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

export async function updatePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : typeof req.body.current_password === "string"
        ? req.body.current_password
        : "";
    const newPassword =
      typeof req.body.newPassword === "string"
        ? req.body.newPassword
        : typeof req.body.new_password === "string"
        ? req.body.new_password
        : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `Password should be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }

    const account = await findAccountById(userId);
    if (!account) return res.status(404).json({ error: "User not found" });

    const ok = await verifyPassword(currentPassword, account.hashedpassword);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await hashPassword(newPassword);
    const updated = await updateAccountPassword(userId, hashedPassword);

    const user = toPublicAccount(updated);
    const token = createToken(user);
    return res.json({ message: "Password updated", user, token });
  } catch (err) {
    return next(err);
  }
}

export async function deleteMe(req, res, next) {
  try {
    const userId = req.user.id;
    const deleted = await deleteAccountAndOwnedGroups(userId);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "Account deleted" });
  } catch (err) {
    return next(err);
  }
}
