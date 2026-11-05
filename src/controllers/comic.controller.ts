import { asc, eq } from "drizzle-orm";
import type { Response } from "express";

import { db } from "../db/index.js";
import { comics, type NewComic } from "../db/schema.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/httpError.js";
import { assertUuid, optionalString, required } from "../utils/validation.js";

/** GET /api/comics */
export const listComics = asyncHandler(async (_req, res: Response) => {
  const rows = await db.select().from(comics).orderBy(asc(comics.createdAt));
  res.json({ data: rows });
});

/** GET /api/comics/:id */
export const getComic = asyncHandler(async (req, res: Response) => {
  const id = assertUuid(req.params.id);
  const [comic] = await db.select().from(comics).where(eq(comics.id, id)).limit(1);
  if (!comic) throw new NotFoundError(`Comic dengan id '${id}' tidak ditemukan`);
  res.json({ data: comic });
});

/** POST /api/comics */
export const createComic = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const payload: NewComic = {
    title: required(body, "title"),
    author: required(body, "author"),
    imageUrl: required(body, "imageUrl"),
  };
  const [comic] = await db.insert(comics).values(payload).returning();
  res.status(201).json({ data: comic });
});

/** PUT /api/comics/:id */
export const updateComic = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const id = assertUuid(req.params.id);
  const body = req.body as Record<string, unknown>;

  const [existing] = await db.select().from(comics).where(eq(comics.id, id)).limit(1);
  if (!existing) throw new NotFoundError(`Comic dengan id '${id}' tidak ditemukan`);

  const payload: Partial<NewComic> = {
    title: optionalString(body, "title", existing.title),
    author: optionalString(body, "author", existing.author),
    imageUrl: optionalString(body, "imageUrl", existing.imageUrl),
  };

  const [comic] = await db.update(comics).set(payload).where(eq(comics.id, id)).returning();
  res.json({ data: comic });
});

/** DELETE /api/comics/:id */
export const deleteComic = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const id = assertUuid(req.params.id);
  const [deleted] = await db.delete(comics).where(eq(comics.id, id)).returning({ id: comics.id });
  if (!deleted) throw new NotFoundError(`Comic dengan id '${id}' tidak ditemukan`);
  res.json({ message: "Comic berhasil dihapus", id: deleted.id });
});
