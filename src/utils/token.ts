import {
  createHash,
  randomBytes,
} from "node:crypto";

export const createOpaqueToken = (
  bytes = 32,
) => {
  return randomBytes(bytes).toString(
    "hex",
  );
};

export const hashToken = (
  token: string,
) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};