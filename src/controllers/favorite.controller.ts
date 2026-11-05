import { and, eq } from "drizzle-orm";
import type { Response } from "express";

import { db } from "../db/index.js";
import { comics, favorites, museums } from "../db/schema.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/httpError.js";
import { assertUuid } from "../utils/validation.js";

function parseItemType(value: unknown): "comic" | "museum" {
  if (value === "comic" || value === "museum") return value;
  throw new ValidationError("Field 'itemType' harus 'comic' atau 'museum'");
}

/** GET /api/favorites → { comics: [...], museums: [...] } */
export const listFavorites = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const rows = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, req.auth!.userId));

  const comicIds = rows.filter((r) => r.itemType === "comic").map((r) => r.itemId);
  const museumIds = rows.filter((r) => r.itemType === "museum").map((r) => r.itemId);

  const favComics =
    comicIds.length > 0
      ? (await db.select().from(comics)).filter((c) => comicIds.includes(c.id))
      : [];
  const favMuseums =
    museumIds.length > 0
      ? (await db.select().from(museums)).filter((m) => museumIds.includes(m.id))
      : [];

  res.json({
    comics: favComics,
    museums: favMuseums,
  });
});

/** POST /api/favorites body { itemType, itemId } */
export const addFavorite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const itemType = parseItemType(body.itemType);
  const itemId = assertUuid(
    typeof body.itemId === "string" ? body.itemId : undefined,
    "itemId"
  );

  // itemId harus benar ada di tabel terkait
  if (itemType === "comic") {
    const [row] = await db.select({ id: comics.id }).from(comics).where(eq(comics.id, itemId)).limit(1);
    if (!row) throw new NotFoundError(`Comic dengan id '${itemId}' tidak ditemukan`);
  } else {
    const [row] = await db.select({ id: museums.id }).from(museums).where(eq(museums.id, itemId)).limit(1);
    if (!row) throw new NotFoundError(`Museum dengan id '${itemId}' tidak ditemukan`);
  }

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, req.auth!.userId),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    throw new ConflictError("Item sudah ada di daftar favorit");
  }

  await db.insert(favorites).values({ userId: req.auth!.userId, itemType, itemId });
  res.status(201).json({ message: "Ditambahkan ke favorit", itemType, itemId });
});

/** DELETE /api/favorites body { itemType, itemId } */
export const removeFavorite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const itemType = parseItemType(body.itemType);
  const itemId = assertUuid(
    typeof body.itemId === "string" ? body.itemId : undefined,
    "itemId"
  );

  const deleted = await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, req.auth!.userId),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId)
      )
    )
    .returning({ id: favorites.id });

  if (deleted.length === 0) {
    throw new NotFoundError("Item tidak ada di daftar favorit");
  }
  res.json({ message: "Dihapus dari favorit", itemType, itemId });
});
