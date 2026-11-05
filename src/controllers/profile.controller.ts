import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Response } from "express";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, UnauthorizedError } from "../utils/httpError.js";
import { optionalString, required } from "../utils/validation.js";

const PROFILE_MENUS = [
  { id: "profile", title: "Profile", showChevron: true },
  { id: "favorite", title: "Favorite", showChevron: true },
  { id: "payment", title: "Payment Method", showChevron: true },
  { id: "privacy", title: "Privacy Policy", showChevron: true },
  { id: "settings", title: "Settings", showChevron: true },
  { id: "help", title: "Help", showChevron: true },
  { id: "logout", title: "Logout", showChevron: false },
];

export interface ProfileMenu {
  id: string;
  title: string;
  showChevron: boolean;
}

/** GET /api/profile */
export const getProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.auth!.userId)).limit(1);
  if (!user) throw new NotFoundError("User tidak ditemukan");

  res.json({
    user: { name: user.name, username: user.username, avatarUrl: user.avatarUrl },
    menus: PROFILE_MENUS satisfies ProfileMenu[],
  });
});

/** PUT /api/profile — update name / avatarUrl */
export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const [current] = await db.select().from(users).where(eq(users.id, req.auth!.userId)).limit(1);
  if (!current) throw new NotFoundError("User tidak ditemukan");

  const [updated] = await db
    .update(users)
    .set({
      name: optionalString(body, "name", current.name),
      avatarUrl: optionalString(body, "avatarUrl", current.avatarUrl),
    })
    .where(eq(users.id, req.auth!.userId))
    .returning();

  res.json({
    message: "Profil berhasil diperbarui",
    user: { name: updated.name, username: updated.username, avatarUrl: updated.avatarUrl },
    menus: PROFILE_MENUS satisfies ProfileMenu[],
  });
});

/** PUT /api/profile/password — ganti password (perlu password lama) */
export const updatePassword = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const oldPassword = required(body, "oldPassword");
  const newPassword = required(body, "newPassword");

  if (newPassword.length < 6) {
    throw new UnauthorizedError("Password baru minimal 6 karakter");
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.auth!.userId)).limit(1);
  if (!user) throw new NotFoundError("User tidak ditemukan");

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new UnauthorizedError("Password lama salah");
  }

  await db
    .update(users)
    .set({ password: await bcrypt.hash(newPassword, 10) })
    .where(eq(users.id, user.id));

  res.json({ message: "Password berhasil diubah" });
});
