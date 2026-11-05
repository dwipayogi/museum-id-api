import { Router } from "express";

import * as museum from "../controllers/museum.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const museumRouter = Router();

museumRouter.get("/", museum.listMuseums);
museumRouter.get("/:id", museum.getMuseum);
museumRouter.post("/", requireAuth, requireAdmin, museum.createMuseum);
museumRouter.put("/:id", requireAuth, requireAdmin, museum.updateMuseum);
museumRouter.delete("/:id", requireAuth, requireAdmin, museum.deleteMuseum);
