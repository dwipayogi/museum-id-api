import { Router } from "express";

import * as profile from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, profile.getProfile);
profileRouter.put("/", requireAuth, profile.updateProfile);
profileRouter.put("/password", requireAuth, profile.updatePassword);
