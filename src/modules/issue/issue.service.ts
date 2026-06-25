import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { GetIssuesQuery, IssuesPayload } from "./issue.interface";

// ===========create issues===========
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

// =========get all issues with query==========
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

// =========get single issues by id=========
const getSingleIssueFromDb = async (id: number) => {
  const result = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("This issue is not found!!");
  }
  const { reporter_id, created_at, updated_at, ...issueData } = result.rows[0];

  const findReporter = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=$1
    `,
    [reporter_id],
  );

  const reporter = findReporter.rows[0];

  return {
    ...issueData,
    reporter,
    created_at,
    updated_at,
  };
};

const updateIssueInDb = async (
  user: JwtPayload,
  issueId: number,
  payload: any,
) => {
  const { title, description, type } = payload;
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId],
  );

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not founded");
  }

  const issue = issueResult.rows[0];

  // check role and set permission validation
  if (user.role === "contributor") {
    if (user.id !== issue.reporter_id) {
      throw new Error("You are not authorized to update this issue");
    }

    if (issue.status !== "open") {
      throw new Error("Only open issues can be updated");
    }
  }

  if (title && title.length > 150) {
    throw new Error("Title must not exceed 150 characters");
  }

  if (description && description.length < 20) {
    throw new Error("Description must be at least 20 characters long");
  }

  const result = await pool.query(
    `
    UPDATE issues 
    SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $4

    RETURNING *
    `,
    [title, description, type, issueId],
  );
  return result;
};

const deleteIssueFromDb = async (user: JwtPayload, issueId: number) => {
  if (user.role !== "maintainer") {
    const error: any = new Error("Only maintainers can perform this action");
    error.statusCode = 403;
    throw error;
  }

  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1 RETURNING *
    `,
    [issueId],
  );

  if (result.rows.length === 0) {
    throw new Error("Something went wrong!!");
  }
  return result;
};
export const issuesService = {
  createIssuesIntoDb,
  getAllIssuesFromDb,
  getSingleIssueFromDb,
  updateIssueInDb,
  deleteIssueFromDb,
};
