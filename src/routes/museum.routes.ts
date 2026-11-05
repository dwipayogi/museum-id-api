import { Router } from "express";

import * as museum from "../controllers/museum.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const museumRouter = Router();

museumRouter.get("/", museum.listMuseums);
museumRouter.get("/:id", museum.getMuseum);
museumRouter.post("/", requireAuth, museum.createMuseum);
museumRouter.put("/:id", requireAuth, museum.updateMuseum);
museumRouter.delete("/:id", requireAuth, museum.deleteMuseum);
