# ETHERA — Team Task Manager

A modern full-stack Team Task Manager built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control** — Admin and Member roles with different permissions
- **Project Management** — Create, edit, delete projects and assign team members
- **Task Management** — Full CRUD with priority, status, due dates, and assignment
- **Dashboard** — Real-time analytics with completion rates, priority distribution, and recent activity
- **Responsive UI** — Dark-themed, glassmorphism design with Tailwind CSS

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React, TypeScript, Tailwind CSS v4  |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB with Mongoose               |
| Auth      | JWT + bcrypt                        |
| Build     | Vite                                |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ethera
JWT_SECRET=your_secret_key_here
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` with API proxy to `http://localhost:5000`.

## API Endpoints

### Auth
| Method | Endpoint         | Access  | Description        |
|--------|------------------|---------|--------------------|
| POST   | /api/auth/signup | Public  | Register user      |
| POST   | /api/auth/login  | Public  | Login user         |
| GET    | /api/auth/me     | Private | Get current user   |
| GET    | /api/auth/users  | Admin   | Get all users      |

### Projects
| Method | Endpoint           | Access  | Description        |
|--------|--------------------|---------|--------------------|
| POST   | /api/projects      | Admin   | Create project     |
| GET    | /api/projects      | Private | List projects      |
| GET    | /api/projects/:id  | Private | Get project        |
| PUT    | /api/projects/:id  | Admin   | Update project     |
| DELETE | /api/projects/:id  | Admin   | Delete project     |

### Tasks
| Method | Endpoint        | Access  | Description        |
|--------|-----------------|---------|--------------------|
| POST   | /api/tasks      | Admin   | Create task        |
| GET    | /api/tasks      | Private | List tasks         |
| GET    | /api/tasks/:id  | Private | Get task           |
| PUT    | /api/tasks/:id  | Private | Update task        |
| DELETE | /api/tasks/:id  | Admin   | Delete task        |

### Dashboard
| Method | Endpoint        | Access  | Description        |
|--------|-----------------|---------|--------------------|
| GET    | /api/dashboard  | Private | Get analytics      |

## Folder Structure

```
ETHERA/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── server.js
└── client/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── routes/
        ├── services/
        └── App.tsx
```

## Deployment

1. **Database**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud-hosted MongoDB
2. **Backend**: Deploy to [Railway](https://railway.app) 
3. **Frontend**: Deploy to  [Railway](https://railway.app) 

Update `MONGO_URI` in production environment variables to point to your Atlas cluster.


