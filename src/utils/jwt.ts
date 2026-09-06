import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

export type UserRole =
  | "CUSTOMER"
  | "TEAM_MEMBER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type AccessTokenPayload = JwtPayload & {
  id: string;
  email: string;
  role: UserRole;
};

export type RefreshTokenPayload = JwtPayload & {
  id: string;
};

export const jwtUtils = {
  createAccessToken(
    payload: Omit<
      AccessTokenPayload,
      keyof JwtPayload
    >,
    secret: string,
    expiresIn: string,
  ) {
    return jwt.sign(payload, secret, {
      expiresIn:
        expiresIn as SignOptions["expiresIn"],
    });
  },

  verifyAccessToken(
    token: string,
    secret: string,
  ) {
    return jwt.verify(
      token,
      secret,
    ) as AccessTokenPayload;
  },

  createRefreshToken(
    payload: { id: string },
    secret: string,
    expiresIn: string,
  ) {
    return jwt.sign(payload, secret, {
      expiresIn:
        expiresIn as SignOptions["expiresIn"],
    });
  },

  verifyRefreshToken(
    token: string,
    secret: string,
  ) {
    return jwt.verify(
      token,
      secret,
    ) as RefreshTokenPayload;
  },
};