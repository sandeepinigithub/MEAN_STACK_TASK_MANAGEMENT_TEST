# MEAN Stack — Task Management System

A full-stack, role-based **Task Management Application** built with the **MEAN stack** (MongoDB · Express · Angular · Node.js). It supports three hierarchical roles — **Manager**, **Team Lead**, and **Employee** — each with scoped visibility and action permissions. The backend is also wired with **Socket.IO** for real-time event delivery.

##  System Screenshots

Want to see the application UI?

**[Jump to Application Screenshots ↓](#application-screenshots)**

---


## Features

- **JWT Authentication** — token-based login with 30-minute expiry
- **Role-based Access Control** — three roles with isolated data visibility
- **Task CRUD** — create, view, edit, delete, and reassign tasks
- **User Management** — manager can create and manage all users
- **Hierarchical data scoping** — employees see only their tasks; team leads see theirs + their team's; managers see everything
- **Dashboard** — summary counts (total / pending / in-progress / completed) + 5 most-recent tasks
- **Paginated lists** — server-side pagination for tasks
- **Real-time events** — Socket.IO server emits `task:created`, `task:updated`, `task:deleted` on mutations (Not implemented from UI)
- **PrimeNG UI** — data tables, dialogs, dropdowns, form validation messages
- **Request validation** — Joi schemas enforce input on all endpoints

---

## API Reference

**Base URL:** `http://localhost:3000`

**Standard Response Envelope:**

```json
// Success
{ "success": true,  "message": "...", "data": { ... }, "meta": { ... } }

// Error
{ "success": false, "message": "...", "data": null,    "errors": [ ... ] }
```

---

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | None | API health & timestamp |

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/register` | None | `{ username, email, password }` | Create account (always `employee` role) |
| `POST` | `/api/auth/login` | None | `{ email, password }` | Login — returns `{ user, token }` |

> **Note:** `register` does **not** return a token. The user must log in after registration.

---

### Users — `/api/users`

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Roles | Query Params | Description |
|--------|----------|-------|-------------|-------------|
| `GET` | `/api/users` | manager, teamlead | `role`, `page`, `limit` | Paginated user list (role-scoped) |
| `POST` | `/api/users` | manager | — | Create user with any role |
| `GET` | `/api/users/master-list` | all | — | Flat dropdown list `(_id, username, role)` |
| `GET` | `/api/users/:id` | manager, teamlead | — | Get user by ID (scoped) |
| `PATCH` | `/api/users/:id` | manager | — | Update user fields |
| `DELETE` | `/api/users/:id` | manager | — | Soft-delete user (cannot self-delete) |

---

### Tasks — `/api/tasks`

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Query / Body | Description |
|--------|----------|-------------|-------------|
| `GET` | `/api/tasks` | `status`, `assignedTo`, `page`, `limit` | Paginated task list (role-scoped) |
| `POST` | `/api/tasks` | `{ title, description, status, assignedTo }` | Create task |
| `GET` | `/api/tasks/dashboard/summary` | — | Count breakdown by status |
| `GET` | `/api/tasks/dashboard/recent` | — | 5 most-recent tasks |
| `GET` | `/api/tasks/:id` | — | Single task details |
| `PATCH` | `/api/tasks/:id` | `{ title?, description?, status?, assignedTo? }` | Update / reassign task |
| `DELETE` | `/api/tasks/:id` | — | Delete task |


---

## Setup — Backend

### Clone & install

```bash
cd task-management-backend
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
NODE_ENV=development
PORT=3000

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://sandeepini2012_db_user:z0ui9u9Nj53xdnEu@cluster0.ne0cuwp.mongodb.net/task_management_db

# JWT signing secret — use a long random string in production
JWT_SECRET=task_mgmt_jwt_secret_dev_2026

# Angular dev server origin
CLIENT_ORIGIN=http://localhost:4200
```


### Seed the database (If required Since I used cloud data will there do not seed if you don't want enter all data)

The seed script creates the default **Manager** account. It is idempotent — safe to re-run.

```bash
npm run seed
```

You will see:

```
Running seeder...

Manager seeded successfully
   Name  : Manager Sandeep
   Email : manager@yopmail.com
   Role  : manager
   ID    : <ObjectId>

Database disconnected. Done.
```

### Default Manager Credentials

| Field | Value |
|-------|-------|
| **Email** | `manager@yopmail.com` |
| **Password** | `Password@123` |
| **Role** | `manager` |

> The manager account is the only way to create **Team Lead** and additional **Employee** users from within the application. Employees who self-register via the `/register` page are always assigned the `employee` role automatically.

### Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```


---

## Setup — Frontend

### Step 1 — Install dependencies

```bash
cd task-management-ui
npm install
```

### Verify API URL

The frontend points to `http://localhost:3000` by default. If your backend runs on a different port, update:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000'   // ← change if needed
};
```

### Start the dev server

```bash
npm start
# or
ng serve
```

The app opens at **[http://localhost:4200](http://localhost:4200)**.

### Log in

Use the seeded Manager credentials:

| Field | Value |
|-------|-------|
| Email | `manager@yopmail.com` |
| Password | `Password@123` |

From the Manager account you can:
- Create **Team Lead** users and assign them a manager
- Create **Employee** users and assign them a team lead
- Create and manage tasks for any user

---



## Socket.IO

The backend is fully wired for real-time communication using **Socket.IO v4**.

### Server setup

> **Current status:** The backend emits all three events on every task mutation. The Angular frontend does **not** yet include `socket.io-client` real-time listeners are a planned future enhancement.

---

## 10. Application Screenshots

### Login Page

![Login Page](Documentation/images/loginPage.png)

---

### Login — Create Account

![Login Page Create Account](Documentation/images/loginPageCreateAccount.png)

---

### Logged-in User (Header)

![Logged In User](Documentation/images/loggedInUser.png)

---

### Dashboard

![Dashboard](Documentation/images/dashboard.png)

---

### Dashboard — Manager vs Team Lead Separation

![Manager TeamLead Separation Dashboard](Documentation/images/ManagerTeamLeadSeperation_dashboard.png)

---

### Task List

![Task List](Documentation/images/taskList.png)

---

### Create Task

![Create Task](Documentation/images/createTask.png)

---

### Task Details Page

![Task Details Page](Documentation/images/taskDetailspage.png)

---

### Edit Task / Reassign

![Task Edit Reassign](Documentation/images/taskEditReassign.png)

---

### User List (Manager Only)

![User List Only Manager](Documentation/images/userListOnlyManager.png)

---

### User Details

![User Details](Documentation/images/userDetails.png)

---

### Edit User — Assign a Team Lead

![Edit User Assign A Team Lead](Documentation/images/EdituserAssignATeamLead.png)

---

### Team Lead View — No User Management Menu

![Team Lead No User Management](Documentation/images/TeamLeadNoUM.png)

---

## Author

**Sandeep Kumar Shukla**
