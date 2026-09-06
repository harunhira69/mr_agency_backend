import {
  NextFunction,
  Request,
  Response,
} from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const catchAsync =
  (handler: AsyncHandler) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(
      handler(req, res, next)
    ).catch(next);
  };