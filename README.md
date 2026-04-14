# 🔥 CodeForge – Developer Collaboration Platform

A full-stack developer collaboration platform with **Student** and **Admin** roles.

## ✨ Features

### Students
- Register & login with JWT authentication
- Create, edit, delete posts (project ideas, bugs, solutions, updates)
- Like posts, add/delete comments
- Global feed with search & category filters
- Personal dashboard with stats
- Editable profile page

### Admins
- Separate admin role (same login page)
- Admin dashboard with platform analytics
- View, search, and delete any post
- View, activate/deactivate, and delete any user
- Category breakdown charts


### Default Admin Login
```
Email:    admin@codeforge.dev
Password: Admin@123456
```
> The admin is auto-seeded on first server start. Change credentials in `backend/.env` before deployment.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `your_super_secret_key_here_32chars` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `NODE_ENV` | Environment | `production` |
| `ADMIN_EMAIL` | Initial admin email | `admin@codeforge.dev` |
| `ADMIN_PASSWORD` | Initial admin password | `Admin@123456` |
| `ADMIN_USERNAME` | Initial admin username | `codeforge_admin` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.vercel.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-api.onrender.com/api` |


## 🔄 Alternative: Railway Deployment (Backend)

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub → select your repo
3. Set root directory to `backend`
4. Add environment variables (same as Render above)
5. Railway auto-detects Node.js and deploys

---

## 📁 Project Structure

```
codeforge/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── user.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   └── Post.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── user.routes.js
│   │   └── admin.routes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── posts/
    │   │       ├── PostCard.jsx
    │   │       └── PostForm.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Feed.jsx
    │   │   ├── PostDetail.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminUsers.jsx
    │   │   ├── AdminPosts.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── store/
    │   │   └── authStore.js
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| State | Zustand |
| HTTP | Axios |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Dates | date-fns |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Posts
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/posts` | Authenticated |
| GET | `/api/posts/:id` | Authenticated |
| GET | `/api/posts/user/:userId` | Authenticated |
| POST | `/api/posts` | Authenticated |
| PUT | `/api/posts/:id` | Owner |
| DELETE | `/api/posts/:id` | Owner or Admin |
| POST | `/api/posts/:id/like` | Authenticated |
| POST | `/api/posts/:id/comments` | Authenticated |
| DELETE | `/api/posts/:id/comments/:commentId` | Author/Owner/Admin |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/:id/profile` | Authenticated |
| PUT | `/api/users/profile` | Authenticated (own) |
| PUT | `/api/users/password` | Authenticated (own) |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/stats` | Admin only |
| GET | `/api/admin/users` | Admin only |
| DELETE | `/api/admin/users/:id` | Admin only |
| PUT | `/api/admin/users/:id/toggle` | Admin only |
| GET | `/api/admin/posts` | Admin only |
| DELETE | `/api/admin/posts/:id` | Admin only |

---

## 🔒 Security Features

- JWT tokens with role payload (`student` / `admin`)
- bcrypt password hashing (salt rounds: 12)
- Role-based route guards on both frontend and backend
- CORS configured with origin whitelist
- Soft-delete pattern (data preserved, just hidden)
- Protected admin endpoints with double middleware
- Token auto-removal on 401 responses

