import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { loginSchema, registerSchema } from "./auth.schema";
import { loginUser, registerUser } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const result = await registerUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in successfully",
    data: result,
  });
});

export const AuthController = {
  register,
  login,
};
