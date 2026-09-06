import { Response } from "express";

interface SendResponseOptions<T> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendResponse = <T>(
  res: Response,
  options: SendResponseOptions<T>
) => {
  const {
    statusCode = 200,
    success = true,
    message,
    data,
    meta,
  } = options;

  return res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  });
};