# 🚀 DevPulse - Tech Issue & Feature Tracker

DevPulse is a RESTful Backend API built with **Node.js, Express.js, TypeScript, and PostgreSQL**. It enables software teams to report bugs, request new features, and manage issues securely using **JWT Authentication** and **Role-Based Authorization**.

---

## 🌐 Live Demo

🔗 **Live API:** https://dev-pulse-sable-zeta.vercel.app/

🔗 **GitHub Repository:** https://github.com/NazmulhaqueD/dev-pulse

---

## ✨ Features

- 🔐 JWT Authentication & Authorization
- 🔒 Secure password hashing using bcrypt
- 👥 Role-Based Access Control (Contributor & Maintainer)
- 🐞 Create Bug Reports & Feature Requests
- 📋 Retrieve all issues with filtering & sorting
- 🔍 Get a single issue by ID
- ✏️ Update issues with permission validation
- 🗑️ Delete issues (Maintainer only)
- 📦 Modular Project Architecture
- 🛡️ Input Validation
- 📤 Reusable API Response Utility
- 🗄️ PostgreSQL with Raw SQL (`pg`)

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- pg
- bcrypt
- jsonwebtoken
- dotenv
- cors

---

# 📂 Project Structure

```text
src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   └── issues
│   │
│   ├── middleware
│   ├── utility
│   ├── config
│   ├── db
│   └── types
│
├── app.ts
└── server.ts
```

---

# ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/NazmulhaqueD/dev-pulse.git
```

### 2. Navigate to Project

```bash
cd dev-pulse
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=your_postgresql_database_url

JWT_ACCESS_SECRET=your_secret_key

JWT_ACCESS_EXPIRES_IN=7d
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build Project

```bash
npm run build
```

### 7. Start Production Server

```bash
npm start
```

---

# 📌 API Endpoints

## 🔐 Authentication

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## 🐞 Issues

### Create Issue

```http
POST /api/issues
```

**Authentication Required**

---

### Get All Issues

```http
GET /api/issues
```

### Optional Query Parameters

| Query  | Values                        |
| ------ | ----------------------------- |
| sort   | newest / oldest               |
| type   | bug / feature_request         |
| status | open / in_progress / resolved |

Example

```http
GET /api/issues?sort=newest&type=bug&status=open
```

---

### Get Single Issue

```http
GET /api/issues/:id
```

---

### Update Issue

```http
PATCH /api/issues/:id
```

**Authentication Required**

- Maintainer can update any issue.
- Contributor can update only their own issue if the status is **open**.

---

### Delete Issue

```http
DELETE /api/issues/:id
```

**Maintainer Only**

---

# 🗄️ Database Schema

## Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR                  |
| email      | VARCHAR UNIQUE           |
| password   | TEXT                     |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

---

## Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

---

# 🔐 Authentication

Protected routes require a valid JWT token.

```http
Authorization: <JWT_TOKEN>
```

---

# 👥 User Roles

## Contributor

- Register
- Login
- Create Issue
- View All Issues
- View Single Issue
- Update Own Issue (Only if status is open)

---

## Maintainer

- All Contributor Permissions
- Update Any Issue
- Delete Any Issue

---

# 📤 Standard API Response

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": {}
}
```

---

# 👨‍💻 Author

**Md. Nazmul Haque**

GitHub: https://github.com/NazmulhaqueD
