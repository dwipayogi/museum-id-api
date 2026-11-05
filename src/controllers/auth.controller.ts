import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Response } from "express";

import { db } from "../db/index.js";
import { users, type User } from "../db/schema.js";
import { signToken, verifyToken, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../utils/httpError.js";
import { required } from "../utils/validation.js";

function toProfile(user: User) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const username = required(body, "username").toLowerCase();
  const password = required(body, "password");
  const name = required(body, "name");
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : "";

  if (password.length < 6) {
    throw new ValidationError("Password minimal 6 karakter");
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    throw new ValidationError("Username hanya boleh berisi huruf, angka, titik, underscore, dan tanda minus");
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (existing.length > 0) {
    throw new ConflictError(`Username '${username}' sudah dipakai`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ username, password: passwordHash, name, avatarUrl })
    .returning();

  res.status(201).json({ token: signToken({ userId: user.id, username: user.username, role: user.role }), user: toProfile(user) });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const username = required(body, "username").toLowerCase();
  const password = required(body, "password");

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError("Username atau password salah");
  }

  res.json({ token: signToken({ userId: user.id, username: user.username, role: user.role }), user: toProfile(user) });
});

/** GET /api/auth/me — cek token */
export const me = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const header = req.headers.authorization ?? "";
  const payload = verifyToken(header.replace("Bearer ", ""));
  if (!payload) {
    throw new UnauthorizedError("Token tidak valid atau kedaluwarsa");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user) throw new NotFoundError("User tidak ditemukan");

  res.json({ user: toProfile(user) });
});
