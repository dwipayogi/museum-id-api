import { Router } from "express";

import * as comic from "../controllers/comic.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const comicRouter = Router();

comicRouter.get("/", comic.listComics);
comicRouter.get("/:id", comic.getComic);
comicRouter.post("/", requireAuth, comic.createComic);
comicRouter.put("/:id", requireAuth, comic.updateComic);
comicRouter.delete("/:id", requireAuth, comic.deleteComic);
