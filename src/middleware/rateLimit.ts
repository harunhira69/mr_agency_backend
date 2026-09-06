import type {
  NextFunction,
  Request,
  Response,
} from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(
  options: {
    windowMs: number;
    max: number;
    message?: string;
  },
) {
  const buckets =
    new Map<string, Bucket>();

  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const key = `${req.ip}:${req.path}`;

    const now = Date.now();

    const current =
      buckets.get(key);

    if (
      !current ||
      current.resetAt <= now
    ) {
      buckets.set(key, {
        count: 1,
        resetAt:
          now + options.windowMs,
      });

      return next();
    }

    current.count += 1;

    if (
      current.count > options.max
    ) {
      res.setHeader(
        "Retry-After",
        Math.ceil(
          (current.resetAt - now) /
            1000,
        ),
      );

      return res
        .status(429)
        .json({
          success: false,
          message:
            options.message ||
            "Too many requests. Please try again later.",
        });
    }

    return next();
  };
}