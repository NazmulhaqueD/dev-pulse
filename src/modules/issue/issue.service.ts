import { pool } from "../../db";
import type { IssuesPayload } from "./issue.interface";

const createIssuesIntoDb = async (
  payload: IssuesPayload,
  reporter_id: number,
) => {
  const { title, description, type } = payload;

  if (!title || !description || !type) {
    throw new Error("Must be provide title, description and type");
  }
  if (title.length >= 150) {
    throw new Error("Title must not exceed 150 characters");
  }
  if (description.length < 20) {
    throw new Error("Description must be at least 20 characters long");
  }

  const result = await pool.query(
    `
          INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) RETURNING *
          `,
    [title, description, type, reporter_id],
  );

  return result;
};

export const issuesService = {
  createIssuesIntoDb,
};
