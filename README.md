# Online Student Feedback System

Prototype where students sign in, pick a course, give a 1–5 rating plus comments, and faculty/admin view results.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT auth

## Features
- Student registration and login (bcrypt + JWT)
- Course selection (courses already reviewed are disabled)
- Feedback form: star rating, comments, submission (one review per course)
- Admin view: average rating per course, response counts, all comments

## Run locally
Prerequisite: Node 18+ and MongoDB running on localhost.

```bash
# Backend
cd backend && cp .env.example .env && npm install
npm run seed      # sample courses + admin (admin@college.edu / admin123)
npm start         # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/courses | signed in |
| POST | /api/feedback | student |
| GET | /api/feedback/mine | student |
| GET | /api/admin/feedback, /api/admin/summary | admin |

## Git workflow
See [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
