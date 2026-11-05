import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authRouter } from "./routes/auth.routes.js";
import { comicRouter } from "./routes/comic.routes.js";
import { favoriteRouter } from "./routes/favorite.routes.js";
import { museumRouter } from "./routes/museum.routes.js";
import { profileRouter } from "./routes/profile.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "museum-id-api", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/comics", comicRouter);
  app.use("/api/museums", museumRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/favorites", favoriteRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
