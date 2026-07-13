# 🏋️ IronFit Elite — Premium Gym Management Platform

A full-stack, production-ready gym management SaaS application with a luxury brand identity. Built for gym owners who need member management, billing, attendance tracking, workout/diet planning, and automated communication — all in one place.

## ✨ Features

### 🎯 Member Portal
- Self-registration and login
- View attendance history
- Access assigned workouts and diet plans
- Browse membership plans
- Make payments (Razorpay integration)
- Receive notifications

### 👑 Admin Dashboard
- **Dashboard**: Real-time stats (members, revenue, attendance)
- **Members**: CRUD, convert leads, manage subscriptions
- **Plans**: Create and manage membership plans
- **Trainers**: Manage trainer profiles
- **Workouts**: Create workout plans with exercises
- **Diet Plans**: Assign customized diet plans
- **Attendance**: Mark & track attendance (with QR code support)
- **Payments**: View payment history and reports
- **Revenue**: Financial reports (PDF/Excel/CSV export)
- **Leads**: Capture and manage leads from the landing page
- **Notifications**: Send in-app notifications
- **Uploads**: Image management via Cloudinary
- **Automations**: Automated expiry checks and reminders
- **Settings**: Razorpay, SMTP, and WhatsApp configuration

### 🌐 Public Landing Page
- Cinematic hero section with video background
- Programs showcase
- Trainer profiles
- Transformation gallery
- Membership plans comparison
- Testimonials
- Contact form (auto-creates leads)

### 🔒 Security
- JWT-based authentication (admin + member)
- Role-based access control (RBAC)
- Helmet.js security headers
- Rate limiting on auth endpoints
- Input sanitization (XSS protection)
- CORS restricted to frontend URL
- MongoDB ObjectId validation

### 🔌 Integrations
- **Razorpay** — Payment gateway for subscriptions
- **Cloudinary** — Image/media storage
- **SMTP** — Email notifications (welcome emails, expiry reminders)
- **WhatsApp Cloud API** — WhatsApp messaging

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, GSAP, Recharts |
| **Backend** | Node.js, Express, Mongoose (MongoDB ODM) |
| **Database** | MongoDB |
| **Auth** | JSON Web Tokens (JWT) |
| **Payments** | Razorpay |
| **Media** | Cloudinary |
| **Email** | Nodemailer (SMTP) |
| **Messaging** | Meta WhatsApp Cloud API |
| **Testing** | Vitest (backend), Playwright (E2E) |

## 📁 Project Structure

```
gym-website/
├── index.html              # Entry HTML
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── public/                 # Static assets (videos, favicon)
│   ├── favicon.svg
│   ├── icons.svg
│   └── videos/
├── src/                    # Frontend React application
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Root component with routing
│   ├── index.css           # Global styles & design system
│   ├── api/                # API client (axios) & endpoint modules
│   ├── components/         # Reusable UI components
│   │   ├── landing/        # Landing page components
│   │   ├── admin/          # Admin layout & shared components
│   │   ├── member/         # Member portal layout
│   │   └── payments/       # Payment checkout component
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin dashboard pages
│   │   └── member/         # Member portal pages
│   ├── contexts/           # React contexts (Auth, MemberAuth)
│   ├── hooks/              # Custom hooks
│   ├── styles/             # Additional CSS files
│   ├── utils/              # Frontend utilities
│   └── cinematic/          # Cinematic animation components
├── backend/                # Express API server
│   ├── server.js           # Server entry point
│   ├── config/             # Database & environment configuration
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models (MongoDB schemas)
│   ├── routes/             # Express route definitions
│   ├── middleware/         # Auth, RBAC, validation
│   ├── lib/                # Integrations (Razorpay, Cloudinary, Email, WhatsApp)
│   ├── jobs/               # Cron jobs (expiry checks, automations)
│   ├── services/           # Business logic services
│   ├── utils/              # Backend utilities (logger, token generation)
│   ├── scripts/            # Development scripts (backup, seed)
│   └── tests/              # Backend unit tests
├── tests/                  # Playwright E2E tests
├── .env.example            # Environment variable template
└── package.json            # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local instance or Atlas)
- **Razorpay account** (for payments)
- **Cloudinary account** (for image uploads, optional)
- **SMTP credentials** (for emails, optional)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd gym-website

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 5. Seed the database (creates admin user)
# Make sure MongoDB is running first
cd backend
node reset-pw.mjs
cd ..
```

### Running Locally

```bash
# Terminal 1: Start the backend API server
cd backend
npm run dev

# Terminal 2: Start the frontend dev server
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Default Admin Credentials

After seeding:
- **Email**: admin@ironfit.com
- **Password**: admin123

> ⚠️ **Change these immediately in production!**

## 🏗️ Building for Production

```bash
# Build frontend
npm run build

# The static build output will be in the dist/ directory
# The backend API runs separately (server.js)
```

### Deployment Options

1. **Traditional VPS**: Run backend API + serve frontend via Nginx
2. **Platform-as-a-Service**:
   - Backend: Railway, Render, Fly.io, or Heroku
   - Frontend: Vercel, Netlify, or Cloudflare Pages
3. **Docker**: Containerize both services (Dockerfile not included)

For production deployment, ensure:
- `NODE_ENV=production` is set
- Strong `JWT_SECRET` is configured
- Database is backed up regularly
- HTTPS is enforced
- All API credentials are set

## 🧪 Testing

```bash
# Backend tests (Vitest)
cd backend && npm test

# E2E tests (Playwright) — frontend must be running
npx playwright test

# API audit (requires backend running)
cd backend && node full_api_audit.mjs
```

## 📊 API Overview

| Endpoint | Description | Auth |
|----------|-------------|------|
| `GET /api/health` | Health check | Public |
| `GET /api/public/stats` | Public stats | Public |
| `POST /api/auth/login` | Admin login | Public |
| `POST /api/contact` | Contact form | Public |
| `GET /api/plans` | List plans | Public |
| `GET /api/members` | List members | Admin |
| `POST /api/payments/razorpay/create-order` | Create payment | Admin |
| `POST /api/member-auth/login` | Member login | Public |
| ... and many more | See backend/routes/ | |

## 🔐 Environment Variables

See [.env.example](.env.example) for a complete list of all configuration variables.

Key variables:
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for signing tokens
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payment gateway keys
- `VITE_API_URL` — Backend API URL (used by frontend)
- `FRONTEND_URL` — Allowed CORS origin

## 📝 License

Private / Proprietary — All rights reserved.

---

Built with ❤️ by IronFit Elite Team
