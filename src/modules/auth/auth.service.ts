import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { UserPayload } from "./auth.interface";

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

export const authService = {
  signupIntoDb,
};
