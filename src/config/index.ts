import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const optionalEnv = (name: string, fallback: string): string => {
  return process.env[name] || fallback;
};

export const config = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),

  port: Number(optionalEnv("PORT", "5000")),

  databaseUrl: requiredEnv("DATABASE_URL"),

  jwt: {
    accessSecret: requiredEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requiredEnv("JWT_REFRESH_SECRET"),

    accessExpiresIn: optionalEnv(
      "JWT_ACCESS_EXPIRY",
      "15m"
    ),

    refreshExpiresIn: optionalEnv(
      "JWT_REFRESH_EXPIRY",
      "30d"
    ),
  },

  bcrypt: {
    saltRounds: Number(
      optionalEnv("BCRYPT_SALT_ROUNDS", "12")
    ),
  },

  app: {
    url: optionalEnv(
      "APP_URL",
      "http://localhost:3000"
    ),

    apiUrl: optionalEnv(
      "API_URL",
      "http://localhost:5000"
    ),
  },

  cors: {
    origins: optionalEnv(
      "CORS_ORIGINS",
      "http://localhost:3000"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : undefined,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  security: {
    cookieName: optionalEnv(
      "REFRESH_COOKIE_NAME",
      "mr_refresh_token"
    ),

    cookieSecure:
      optionalEnv("NODE_ENV", "development") ===
      "production",
  },
} as const;