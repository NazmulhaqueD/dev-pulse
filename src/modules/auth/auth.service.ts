import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db";
import type { IUser, UserPayload } from "./auth.interface";

// ==========signup==========
const signupIntoDb = async (payload: UserPayload) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;

  return result;
};

// ===========login============
const loginIntoDb = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  const user: IUser = userData.rows[0];

  if (!user) {
    throw new Error("User not found!!");
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credential!");
  }

  //   generate payload and access token
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = await jwt.sign(
    jwtPayload,
    config.jwt_access_secret as string,
    {
      expiresIn: "1d",
    },
  );
  const { password: hashPassword, ...userWithoutPassword } = user;
  return { token: accessToken, user: userWithoutPassword };
};

export const authService = {
  signupIntoDb,
  loginIntoDb,
};
 