import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";

import { UnauthorizedError } from "../utils/httpError.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "museum-id-dev-secret";
const TOKEN_PREFIX = "Bearer ";

export interface AuthedRequest extends Request {
  auth?: { userId: string; username: string };
}

interface TokenPayload extends JwtPayload {
  sub: string;
  username: string;
}

export function signToken(payload: { userId: string; username: string }) {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: payload.userId, username: payload.username }, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ? String(req.headers.authorization) : "";

  if (!header.startsWith(TOKEN_PREFIX)) {
    return next(new UnauthorizedError("Token tidak ada atau formatnya salah (harus 'Bearer <token>')"));
  }

  const payload = verifyToken(header.slice(TOKEN_PREFIX.length));
  if (!payload) {
    return next(new UnauthorizedError("Token tidak valid atau kedaluwarsa"));
  }

  req.auth = { userId: payload.sub, username: payload.username };
  next();
}
