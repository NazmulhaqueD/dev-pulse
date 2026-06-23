import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import sendResponse from "../utility/sendResponse";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "User unauthorized!",
        });
      }

      const decoded = (await jwt.verify(
        token as string,
        config.jwt_access_secret as string,
      )) as JwtPayload;

      //   check user exists or not
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id],
      );

      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!",
        });
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message || "Internal Server Error!!!",
        error: error,
      });
    }
  };
};

export default auth;
