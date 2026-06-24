import { pool } from "../../db";
import type { GetIssuesQuery, IssuesPayload } from "./issue.interface";

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

const getAllIssuesFromDb = async (queryParameter: GetIssuesQuery) => {
  const { sort = "newest", type, status } = queryParameter;

  let sql = `SELECT * FROM issues`;
  const values: any[] = [];
  const conditions: string[] = [];

  // filter bye type
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  // filter by status
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  // Add Where clause
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sorting
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(sql, values);

  const allIssues = result.rows;
  const allReporters_id: Array<number> = [];
  allIssues.forEach((issue) => {
    if (!allReporters_id.includes(issue.reporter_id)) {
      allReporters_id.push(issue.reporter_id);
    }
  });

  const findReporters = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=ANY($1) 
    `,
    [allReporters_id],
  );

  const reporters = findReporters.rows;

  const allIssuesWithReporter = allIssues.map((issue) => {
    const { reporter_id, created_at, updated_at, ...issueWithoutReporterId } =
      issue;
    const reporter = reporters.find((user) => user.id === issue.reporter_id);

    return {
      ...issueWithoutReporterId,
      reporter,
      created_at,
      updated_at,
    };
  });

  return allIssuesWithReporter;
};

export const issuesService = {
  createIssuesIntoDb,
  getAllIssuesFromDb,
};
