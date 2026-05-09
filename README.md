# 🚌 Campus Commute

A full-stack, production-grade college bus tracking and management platform — built with **React + TypeScript (Vite)** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 🌟 Features

- **Live Bus Tracking** — Real-time GPS broadcast from driver to student map via Socket.IO
- **Road-Following Simulation** — Bus icon moves along actual road geometry (OSRM), not straight lines
- **Role-Based Auth** — Admin, Driver, Student with secure JWT sessions
- **OTP Email Verification** — Email-based OTP on signup (Resend HTTP API primary + Gmail SMTP fallback)
- **Admin Control Panel** — Manage global settings, driver assignments, bus routes, and all users
- **Driver Secret Key** — Prevents students from signing up on the Driver portal
- **Registration No. Uniqueness** — One student per registration number enforced in DB
- **Block / Delete Users** — Admins can ban fake or spam accounts instantly
- **Google OAuth Login** — One-tap sign-in for students

---

## 🔑 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.edu` | `Admin@1234` |
| **Driver** | `driver@test.edu` | `Driver@1234` |
| **Student** | `student@test.edu` | `Student@1234` |

> Run `node seedAdmin.js` in the `/backend` directory to create / reset these accounts.

---

## 🔐 Default Driver Secret Key

When a driver signs up, they must enter the **Driver Secret Key** to prove they are an authorized driver (not a student bypassing the role selection).

**Default key:** `DRIVER2024`

> The admin can change this anytime from **Admin Panel → Global Settings → Driver Secret Key**.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Maps** | Leaflet (`react-leaflet`) + OSRM for road routing |
| **Real-time** | Socket.IO (driver → student location) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (cookies) + Google OAuth 2.0 |
| **Email** | Resend HTTP API (primary) + Nodemailer Gmail SMTP (fallback) |

---

## 🏗️ Folder Structure

```
Campus-Commute/
├── Frontend/              # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI (AuthCard, GradientButton, etc.)
│       ├── contexts/      # AuthContext, RouteContext
│       └── pages/         # Student, Driver, Admin pages
│
└── backend/               # Node.js + Express API
    ├── controllers/       # authControllers, adminControllers
    ├── models/            # UserModel, AdminSettings, OTP
    ├── routes/            # userRouter, adminRoutes
    ├── data/              # routes.json (28 bus routes)
    └── seedAdmin.js       # Creates all 3 test users
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
BACKEND_PORT=8000
FRONTEND_URL=https://campus-commute-vrpq.vercel.app
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret

# Gmail (SMTP fallback — may be blocked on some cloud hosts)
EMAIL=webosingh93@gmail.com
EMAIL_PASS="jnfz bbqu zloo kckk"   # Gmail App Password (spaces are auto-stripped)

# Resend (PRIMARY — HTTP API, works on Railway, Render, Vercel, etc.)
RESEND_API_KEY=re_your_api_key_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (`Frontend/.env`)
```env
VITE_BACKEND_URL=https://campus-commute.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🚀 Running Locally

### 1. Backend
```bash
cd backend
npm install
node seedAdmin.js   # Create test users
npm run dev         # Starts on port 8000
```

### 2. Frontend
```bash
cd Frontend
npm install
npm run dev         # Starts on port 8080
```

---

## 📬 Email / OTP Setup

OTP emails are sent using **two methods in priority order**:

### Method 1 (Primary): Resend HTTP API
1. Go to [resend.com](https://resend.com) and sign up for free
2. Dashboard → **API Keys** → **Create API Key**
3. Copy the key and add it to Railway as `RESEND_API_KEY`
4. **Free tier:** 3,000 emails/month, 100/day — more than enough
5. Emails are sent from `onboarding@resend.dev` on the free plan

> ✅ **Recommended** — HTTP-based, never blocked by cloud hosts like Railway

### Method 2 (Fallback): Gmail App Password (SMTP)
1. Enable **2-Factor Authentication** on Gmail account
2. Go to **Google Account → Security → App Passwords**
3. Create an App Password for "Mail"
4. Paste as `EMAIL_PASS` in env (spaces are auto-stripped by the backend)

> ⚠️ **Note:** Gmail SMTP (ports 587 & 465) may be blocked on Railway and similar cloud hosts. Set up Resend as the primary method.

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Student** | Live map, bus tracking, stop timings, driver info |
| **Driver** | GPS broadcast, route map, bus management info |
| **Admin** | Full control: settings, routes, drivers, user management |

---

## 🛡️ Security

- JWT tokens stored in **HTTP-only cookies**
- Driver signup gated by **admin-controlled secret key**
- Blocked users **cannot log in**
- Registration numbers are **unique per student**
- OTP codes expire after **5 minutes** and are deleted from DB after verification

---

## 🔗 Production Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://campus-commute-vrpq.vercel.app |
| **Backend** | https://campus-commute.up.railway.app |
| **Railway Project** | https://railway.com/project/62a1f06d-2cd7-40e6-8b0f-a09304696e5f |
| **Vercel Project** | https://vercel.com/webosingh93-gmailcoms-projects/campus-commute-vrpq |
