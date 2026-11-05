import { Router } from "express";

import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", auth.register);
authRouter.post("/login", auth.login);
authRouter.get("/me", requireAuth, auth.me);
