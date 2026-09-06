import type {
  NextFunction,
  Request,
  Response,
} from "express";

import config from "../config/index.js";
import { query } from "../lib/db.js";

import {
  forbidden,
  unauthorized,
} from "../utils/errors.js";

import {
  jwtUtils,
  type AccessTokenPayload,
} from "../utils/jwt.js";

export type UserRole =
  | "CUSTOMER"
  | "TEAM_MEMBER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status:
    | "PENDING_VERIFICATION"
    | "ACTIVE"
    | "SUSPENDED"
    | "BLOCKED"
    | "DELETED";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header =
      req.headers.authorization;

    const token =
      header?.startsWith("Bearer ")
        ? header
            .slice(7)
            .trim()
        : undefined;

    if (!token) {
      throw unauthorized(
        "You are not logged in. Please log in first.",
      );
    }

    let decoded:
      AccessTokenPayload;

    try {
      decoded =
        jwtUtils.verifyAccessToken(
          token,
          config.jwtAccessSecret,
        );
    } catch {
      throw unauthorized(
        "Invalid or expired access token",
      );
    }

    const result =
      await query<AuthUser>(
        `
        SELECT
          id,
          email,
          role,
          status
        FROM users
        WHERE id = $1
          AND "deletedAt" IS NULL
        LIMIT 1
        `,
        [decoded.id],
      );

    const user =
      result.rows[0];

    if (!user) {
      throw unauthorized(
        "User not found. Please log in again.",
      );
    }

    if (
      [
        "SUSPENDED",
        "BLOCKED",
        "DELETED",
      ].includes(user.status)
    ) {
      throw forbidden(
        "Your account is not allowed to access this resource.",
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(
  ...roles: UserRole[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return next(
        unauthorized(),
      );
    }

    if (
      !roles.includes(
        req.user.role,
      )
    ) {
      return next(
        forbidden(),
      );
    }

    return next();
  };
}

export const requireAdmin =
  requireRole(
    "ADMIN",
    "SUPER_ADMIN",
  );

export const requireStaff =
  requireRole(
    "TEAM_MEMBER",
    "ADMIN",
    "SUPER_ADMIN",
  );