import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupIntoDb(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error: error,
    });
  }
};

export const authController = {
  signup,
};
