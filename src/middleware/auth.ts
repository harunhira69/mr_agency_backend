import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { prisma } from "../lib/prisma";
import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

type AuthUser = {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

type DecodeUser = JwtPayload & {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
};

const createError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

export const requireAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const token =
      authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : undefined;

    if (!token) {
      throw createError(
        "You are not logged in. Please log in first.",
        httpStatus.UNAUTHORIZED
      );
    }

    const verified = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret as string
    );

    if (!verified.success || !verified.data) {
      throw createError(
        verified.message || "Invalid or expired token",
        httpStatus.UNAUTHORIZED
      );
    }

    const decoded = verified.data as DecodeUser;

    if (!decoded.id || !decoded.email || !decoded.role) {
      throw createError("Invalid token payload", httpStatus.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw createError("User not found. Please log in again.", httpStatus.UNAUTHORIZED);
    }

    if (user.status === "SUSPENDED") {
      throw createError(
        "Your account has been suspended. Please contact support.",
        httpStatus.FORBIDDEN
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  }
);

export const requireRole = (...roles: AuthUser["role"][]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw createError(
        "Forbidden. You don't have permission to access this resource.",
        httpStatus.FORBIDDEN
      );
    }

    next();
  });
};
