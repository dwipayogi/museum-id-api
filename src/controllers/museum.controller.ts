import { asc, eq } from "drizzle-orm";
import type { Response } from "express";

import { db } from "../db/index.js";
import { museums, type NewMuseum } from "../db/schema.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/httpError.js";
import { assertUuid, optionalBoolean, optionalString, required } from "../utils/validation.js";

/** GET /api/museums */
export const listMuseums = asyncHandler(async (_req, res: Response) => {
  const rows = await db.select().from(museums).orderBy(asc(museums.createdAt));
  res.json({ data: rows });
});

/** GET /api/museums/:id */
export const getMuseum = asyncHandler(async (req, res: Response) => {
  const id = assertUuid(req.params.id);
  const [museum] = await db.select().from(museums).where(eq(museums.id, id)).limit(1);
  if (!museum) throw new NotFoundError(`Museum dengan id '${id}' tidak ditemukan`);
  res.json({ data: museum });
});

/** POST /api/museums */
export const createMuseum = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const payload: NewMuseum = {
    name: required(body, "name"),
    location: required(body, "location"),
    imageUrl: required(body, "imageUrl"),
    description: required(body, "description"),
    showLocationIcon: optionalBoolean(body, "showLocationIcon", false) ?? false,
  };
  const [museum] = await db.insert(museums).values(payload).returning();
  res.status(201).json({ data: museum });
});

/** PUT /api/museums/:id */
export const updateMuseum = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const id = assertUuid(req.params.id);
  const body = req.body as Record<string, unknown>;

  const [existing] = await db.select().from(museums).where(eq(museums.id, id)).limit(1);
  if (!existing) throw new NotFoundError(`Museum dengan id '${id}' tidak ditemukan`);

  const payload: Partial<NewMuseum> = {
    name: optionalString(body, "name", existing.name),
    location: optionalString(body, "location", existing.location),
    imageUrl: optionalString(body, "imageUrl", existing.imageUrl),
    description: optionalString(body, "description", existing.description),
    showLocationIcon: optionalBoolean(body, "showLocationIcon", existing.showLocationIcon),
  };

  const [museum] = await db.update(museums).set(payload).where(eq(museums.id, id)).returning();
  res.json({ data: museum });
});

/** DELETE /api/museums/:id */
export const deleteMuseum = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const id = assertUuid(req.params.id);
  const [deleted] = await db.delete(museums).where(eq(museums.id, id)).returning({ id: museums.id });
  if (!deleted) throw new NotFoundError(`Museum dengan id '${id}' tidak ditemukan`);
  res.json({ message: "Museum berhasil dihapus", id: deleted.id });
});
