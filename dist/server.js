

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utility/sendResponse.ts
var sendResponse = (res, payload) => {
  const { statusCode, success, message, data, error } = payload;
  return res.status(statusCode).json({
    success,
    message,
    data,
    error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config = {
  port: process.env.PORT,
  connection_string: process.env.CONNECTION_STRING,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({ connectionString: config_default.connection_string });
var initDb = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(30) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
    await pool.query(`
          CREATE TABLE IF NOT EXISTS issues(
          id SERIAL PRIMARY KEY,
          title VARCHAR(150),
          description	TEXT CHECK (LENGTH(description) >= 20),
          type VARCHAR(20) NOT NULL CHECK (type IN ('bug','feature_request')),
          status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
          reporter_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
          `);
    console.log("Database connected successfully");
  } catch (error) {
  }
};

// src/modules/auth/auth.service.ts
var signupIntoDb = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginIntoDb = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  const user = userData.rows[0];
  if (!user) {
    throw new Error("User not found!!");
  }
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credential!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = await jwt.sign(
    jwtPayload,
    config_default.jwt_access_secret,
    {
      expiresIn: "1d"
    }
  );
  const { password: hashPassword, ...userWithoutPassword } = user;
  return { token: accessToken, user: userWithoutPassword };
};
var authService = {
  signupIntoDb,
  loginIntoDb
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await authService.signupIntoDb(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await authService.loginIntoDb(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "User unauthorized!"
        });
      }
      const decoded = await jwt2.verify(
        token,
        config_default.jwt_access_secret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return sendResponse_default(res, {
        statusCode: 500,
        success: false,
        message: error.message || "Internal Server Error!!!",
        error
      });
    }
  };
};
var auth_default = auth;

// src/modules/issue/issue.service.ts
var createIssuesIntoDb = async (payload, reporter_id) => {
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
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDb = async (queryParameter) => {
  const { sort = "newest", type, status } = queryParameter;
  let sql = `SELECT * FROM issues`;
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const result = await pool.query(sql, values);
  const allIssues = result.rows;
  const allReporters_id = [];
  allIssues.forEach((issue) => {
    if (!allReporters_id.includes(issue.reporter_id)) {
      allReporters_id.push(issue.reporter_id);
    }
  });
  const findReporters = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=ANY($1) 
    `,
    [allReporters_id]
  );
  const reporters = findReporters.rows;
  const allIssuesWithReporter = allIssues.map((issue) => {
    const { reporter_id, created_at, updated_at, ...issueWithoutReporterId } = issue;
    const reporter = reporters.find((user) => user.id === issue.reporter_id);
    return {
      ...issueWithoutReporterId,
      reporter,
      created_at,
      updated_at
    };
  });
  return allIssuesWithReporter;
};
var getSingleIssueFromDb = async (id) => {
  const result = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("This issue is not found!!");
  }
  const { reporter_id, created_at, updated_at, ...issueData } = result.rows[0];
  const findReporter = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=$1
    `,
    [reporter_id]
  );
  const reporter = findReporter.rows[0];
  return {
    ...issueData,
    reporter,
    created_at,
    updated_at
  };
};
var updateIssueInDb = async (user, issueId, payload) => {
  const { title, description, type } = payload;
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not founded");
  }
  const issue = issueResult.rows[0];
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
    [title, description, type, issueId]
  );
  return result;
};
var deleteIssueFromDb = async (user, issueId) => {
  if (user.role !== "maintainer") {
    const error = new Error("Only maintainers can perform this action");
    error.statusCode = 403;
    throw error;
  }
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1 RETURNING *
    `,
    [issueId]
  );
  if (result.rows.length === 0) {
    throw new Error("Something went wrong!!");
  }
  return result;
};
var issuesService = {
  createIssuesIntoDb,
  getAllIssuesFromDb,
  getSingleIssueFromDb,
  updateIssueInDb,
  deleteIssueFromDb
};

// src/modules/issue/issue.controller.ts
var createIssues = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const result = await issuesService.createIssuesIntoDb(
      req.body,
      reporter_id
    );
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort = "newest", type, status } = req.query;
    const result = await issuesService.getAllIssuesFromDb(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.getSingleIssueFromDb(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const user = req.user;
    const result = await issuesService.updateIssueInDb(user, issueId, req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const user = req.user;
    const result = await issuesService.deleteIssueFromDb(user, issueId);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssues,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssues);
router2.patch("/:id", auth_default(), issuesController.updateIssue);
router2.delete("/:id", auth_default(), issuesController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Dev-Pulse!!!"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDb();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running on port: ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map