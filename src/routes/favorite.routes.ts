import { Router } from "express";

import * as favorite from "../controllers/favorite.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const favoriteRouter = Router();

favoriteRouter.get("/", requireAuth, favorite.listFavorites);
favoriteRouter.post("/", requireAuth, favorite.addFavorite);
favoriteRouter.delete("/", requireAuth, favorite.removeFavorite);
