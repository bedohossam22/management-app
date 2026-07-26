# 📋 Task Management App

A full-stack task management application built with **React + TypeScript** (frontend) and **Node.js + Express + MongoDB** (backend), featuring JWT authentication, full CRUD task operations, filtering, and search.

---

## 🤖 AI Tools Used in Development

| Tool | Role |
|---|---|
| **DeepSeek** | Initial planning, folder structure design, and architecture decisions |
| **Gemini** | Configuration files (tsconfig, vite.config, vercel.json, environment setup) |
| **Kimi** | Backend debugging — async error handling, Mongoose queries, and middleware logic |
| **Thunder Client** | API testing — all endpoints tested with Thunder Client collections |
| **Antigravity (Google DeepMind)** | Frontend UI enhancement — component design, animations, and UX polish |

---

##  Live Demo

🔗 **[https://management-app-frontend-five.vercel.app/](https://management-app-frontend-five.vercel.app/)**

---

## Test Account Credentials

| Role | Email | Password |
|---|---|---|
| Recruiter / Reviewer | `Test@recruitermail.com` | `Recruit$123456` |

---

## ✅ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v18+**
- [npm](https://www.npmjs.com/) **v9+**
- [MongoDB](https://www.mongodb.com/) — local instance **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

Create a file at `backend/.env` — see [`backend/.env.example`](./backend/.env.example) for the template:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/task-management` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `your_super_secret_key` |

### Frontend (`frontend/.env`)

Create a file at `frontend/.env` — see [`frontend/.env.example`](./frontend/.env.example) for the template:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd management-app
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env       # Fill in your values
npm run dev                # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env       # Fill in your values
npm run dev                # Starts on http://localhost:5173
```

---

## 📁 Project Structure

```
management-app/
├── vercel.json                  # Root Vercel deployment config (frontend + backend services)
│
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app setup — middleware, routes, error handlers
│   │   ├── server.ts            # HTTP server entry point
│   │   ├── config/
│   │   │   └── Mongodb.ts       # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Register & login handlers
│   │   │   └── taskController.ts    # CRUD task handlers with filtering & search
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT authentication middleware
│   │   │   └── errorHandler.ts  # Global error handler
│   │   ├── models/
│   │   │   ├── User.ts          # Mongoose User schema (bcrypt password hashing)
│   │   │   └── Task.ts          # Mongoose Task schema (status, priority, dueDate)
│   │   ├── routes/
│   │   │   ├── authRoutes.ts    # POST /api/auth/register, POST /api/auth/login
│   │   │   └── taskRoutes.ts    # GET/POST/PUT/DELETE /api/tasks (protected)
│   │   ├── validators/
│   │   │   ├── authValidator.ts # express-validator rules for auth
│   │   │   └── taskValidator.ts # express-validator rules for tasks
│   │   └── utils/               # Shared utility helpers
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx              # Root router — public & protected routes
    │   ├── main.tsx             # React entry point with providers
    │   ├── index.css            # Global styles
    │   ├── context/
    │   │   └── AuthContext.tsx  # Global auth state (user, login, logout)
    │   ├── hooks/
    │   │   └── useAuth.ts       # Shortcut hook for AuthContext
    │   ├── services/
    │   │   └── api.ts           # Axios instance with JWT interceptors & 401 redirect
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.tsx       # Login form (react-hook-form + yup)
    │   │   │   └── Register.tsx    # Registration form
    │   │   ├── tasks/
    │   │   │   ├── TaskCard.tsx    # Individual task card display
    │   │   │   ├── TaskDetails.tsx # Expanded task detail view
    │   │   │   ├── TaskFilters.tsx # Filter bar (status, priority, search)
    │   │   │   ├── TaskForm.tsx    # Create / edit task modal form
    │   │   │   └── TaskList.tsx    # Task list renderer
    │   │   └── common/
    │   │       ├── Navbar.tsx       # Top navigation bar with logout
    │   │       ├── PrivateRoute.tsx # Route guard for authenticated users
    │   │       └── LoadingSpinner.tsx
    │   ├── pages/
    │   │   ├── DashboardPage.tsx    # Main app page — tasks + filters + stats
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── NotFoundPage.tsx
    │   │   └── NotAuthorizedPage.tsx
    │   ├── types/               # Shared TypeScript interfaces (Task, User, etc.)
    │   └── utils/               # Frontend helper utilities
    ├── package.json
    └── tsconfig.json
```

---

## 🔌 Main API Endpoints

All task endpoints require the `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT token | ❌ |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "password123" }
```

### Tasks — `/api/tasks`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get all tasks (supports `?status=`, `?priority=`, `?search=`) | ✅ |
| `GET` | `/api/tasks/:id` | Get a single task by ID | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `PUT` | `/api/tasks/:id` | Update a task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete a task | ✅ |

**Task body (create/update):**
```json
{
  "title": "Fix login bug",
  "description": "Optional description",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2025-12-31"
}
```

**Query parameters for `GET /api/tasks`:**

| Param | Values |
|---|---|
| `status` | `To Do`, `In Progress`, `Done` |
| `priority` | `Low`, `Medium`, `High` |
| `search` | Any string — matches task title (case-insensitive) |

---

## ✨ Implemented Features

- [x] **User Authentication** — Register, login, logout with JWT (7-day expiry)
- [x] **Protected Routes** — Unauthenticated users are redirected to `/login`
- [x] **Auto session expiry** — 401 responses auto-redirect and clear localStorage
- [x] **Task CRUD** — Create, read, update, and delete tasks
- [x] **Task Fields** — Title, description, status, priority, due date
- [x] **Task Filtering** — Filter tasks by status and priority
- [x] **Task Search** — Real-time search by title
- [x] **Dashboard Stats** — Summary counts per status
- [x] **Form Validation** — Frontend (yup + react-hook-form) and backend (express-validator)
- [x] **Toast Notifications** — Success/error feedback via react-toastify
- [x] **Responsive UI** — Mobile-friendly layout with TailwindCSS v4
- [x] **Vercel Deployment Config** — Monorepo setup for frontend + backend

---

## ❌ Known Issues & Incomplete Items

- [ ] **No pagination** — All tasks fetched at once; may slow down with large datasets
- [ ] **No task assignment** — Tasks are user-scoped only; no team/multi-user support
- [ ] **No file attachments** — Task file uploads are not implemented
- [ ] **No email verification** — Registration does not verify email addresses
- [ ] **No password reset** — Forgot/reset password flow is not implemented
- [ ] **No due date notifications** — No reminders or alerts for upcoming deadlines
- [ ] **No refresh token** — JWT expires after 7 days with no silent refresh
- [ ] **Open CORS** — `app.use(cors())` allows all origins; restrict in production
- [ ] **No rate limiting** — Auth endpoints are unprotected against brute force
- [ ] **No test suite** — Unit or integration tests have not been written

---

## 🧰 Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Validation:** `express-validator`

### Frontend
- **Framework:** React 19 + TypeScript + Vite 8
- **Routing:** React Router DOM v7
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios (with interceptors)
- **Styling:** TailwindCSS v4
- **Notifications:** React Toastify

### DevOps
- **Deployment:** Vercel (monorepo config)
- **API Testing:** Thunder Client
