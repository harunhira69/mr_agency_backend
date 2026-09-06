import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { LoginInput, RegisterInput } from "./auth.schema";

const createError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export const registerUser = async (payload: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    throw createError("Email is already registered", httpStatus.CONFLICT);
  }

  const saltRounds = Number(config.bycrypt_salt_rounds) || 10;
  const passwordHash = await bcrypt.hash(payload.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    select: publicUserSelect,
  });

  return user;
};

export const loginUser = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw createError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  if (user.status === "SUSPENDED" || user.status === "BLOCKED" || user.status === "DELETED") {
    throw createError(
      "Your account has been suspended. Please contact support.",
      httpStatus.FORBIDDEN
    );
  }

  const accessToken = jwtUtils.createToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expiry as SignOptions
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};
