import { badRequest } from "./errors.js";

export const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

export function stringField(
  value: unknown,
  field: string,
  options?: {
    min?: number;
    max?: number;
    optional?: false;
  },
): string;

export function stringField(
  value: unknown,
  field: string,
  options: {
    min?: number;
    max?: number;
    optional: true;
  },
): string | undefined;

export function stringField(
  value: unknown,
  field: string,
  options: {
    min?: number;
    max?: number;
    optional?: boolean;
  } = {},
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (options.optional) {
      return undefined;
    }

    throw badRequest(
      `${field} is required`,
    );
  }

  if (typeof value !== "string") {
    throw badRequest(
      `${field} must be a string`,
    );
  }

  const trimmed = value.trim();

  if (
    options.min !== undefined &&
    trimmed.length < options.min
  ) {
    throw badRequest(
      `${field} must be at least ${options.min} characters`,
    );
  }

  if (
    options.max !== undefined &&
    trimmed.length > options.max
  ) {
    throw badRequest(
      `${field} must be at most ${options.max} characters`,
    );
  }

  return trimmed;
}

export const emailField = (
  value: unknown,
) => {
  const email = stringField(
    value,
    "email",
    {
      min: 5,
      max: 320,
    },
  );

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  ) {
    throw badRequest(
      "A valid email is required",
    );
  }

  return email.toLowerCase();
};

export const booleanField = (
  value: unknown,
  field: string,
  optional = false,
) => {
  if (
    value === undefined &&
    optional
  ) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw badRequest(
      `${field} must be a boolean`,
    );
  }

  return value;
};

export const integerField = (
  value: unknown,
  field: string,
  options: {
    min?: number;
    max?: number;
    optional?: boolean;
  } = {},
) => {
  if (
    value === undefined &&
    options.optional
  ) {
    return undefined;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isInteger(parsed)) {
    throw badRequest(
      `${field} must be an integer`,
    );
  }

  if (
    options.min !== undefined &&
    parsed < options.min
  ) {
    throw badRequest(
      `${field} must be >= ${options.min}`,
    );
  }

  if (
    options.max !== undefined &&
    parsed > options.max
  ) {
    throw badRequest(
      `${field} must be <= ${options.max}`,
    );
  }

  return parsed;
};

export const enumField = <
  T extends string,
>(
  value: unknown,
  field: string,
  allowed: readonly T[],
  optional = false,
) => {
  if (
    value === undefined &&
    optional
  ) {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !allowed.includes(
      value as T,
    )
  ) {
    throw badRequest(
      `${field} must be one of: ${allowed.join(", ")}`,
    );
  }

  return value as T;
};

export const slugify = (
  value: string,
) =>
  value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(0, 180);