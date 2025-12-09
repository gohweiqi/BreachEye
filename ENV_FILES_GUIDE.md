# Environment Variables Guide

This project uses **two separate `.env` files** - one for the frontend and one for the backend. This is necessary because:

- **Frontend** (Next.js) runs in the browser and needs its own config
- **Backend** (Express/Node.js) runs on the server and handles sensitive operations like sending emails

## 📁 File Locations

```
EmailBreachDetectionSystem/
├── backend/
│   └── .env          ← Backend environment variables
└── frontend/
    └── .env          ← Frontend environment variables
```

---

## 🔙 Backend `.env` File

**Location:** `backend/.env`

**Purpose:** Server-side configuration (email service, database, API server)

### Required Variables:

```env
# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/breacheye

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Email Service (for sending notifications)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=BreachEye <your-email@gmail.com>

# Optional: Custom SMTP (if not using Gmail)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
```

### What goes here:
- ✅ **Email service credentials** (SMTP_USER, SMTP_PASS) - **THIS IS WHERE EMAIL CONFIG GOES!**
- ✅ Database connection (MONGODB_URI)
- ✅ Server port (PORT)
- ✅ Frontend URL (FRONTEND_URL)
- ✅ Any other server-side secrets

---

## 🎨 Frontend `.env` File

**Location:** `frontend/.env`

**Purpose:** Client-side configuration (API endpoints, authentication)

### Required Variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### What goes here:
- ✅ Backend API URL (NEXT_PUBLIC_API_URL)
- ✅ Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- ✅ NextAuth secret (NEXTAUTH_SECRET)
- ❌ **DO NOT put email service credentials here!**

---

## 📧 Email Configuration - Where Does It Go?

**Answer: `backend/.env` file**

The email service runs on the **backend server**, so all SMTP credentials must be in `backend/.env`:

```env
# In backend/.env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=BreachEye <your-email@gmail.com>
```

**Why?**
- Email sending happens on the server (backend)
- The frontend just calls the backend API
- Backend handles the actual email sending using nodemailer

---

## 🚀 Quick Setup Checklist

### Backend Setup:
1. Create `backend/.env` file
2. Add MongoDB URI
3. Add email service credentials (SMTP_USER, SMTP_PASS)
4. Set PORT and FRONTEND_URL

### Frontend Setup:
1. Create `frontend/.env` file
2. Add NEXT_PUBLIC_API_URL (pointing to backend)
3. Add Google OAuth credentials
4. Add NEXTAUTH_SECRET

---

## 🔒 Security Notes

1. **Never commit `.env` files to Git** - They're already in `.gitignore`
2. **Backend `.env`** contains sensitive data (database, email passwords)
3. **Frontend `.env`** - variables starting with `NEXT_PUBLIC_` are exposed to the browser
4. **Never put SMTP passwords in frontend `.env`** - they would be exposed to users!

---

## 📝 Example Files

### `backend/.env` Example:
```env
MONGODB_URI=mongodb://localhost:27017/breacheye
PORT=5000
FRONTEND_URL=http://localhost:3000

# Email Service
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=BreachEye <john.doe@gmail.com>
```

### `frontend/.env` Example:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## ❓ FAQ

**Q: Do I need both .env files?**
A: Yes! The frontend and backend are separate applications that need their own configuration.

**Q: Where do email credentials go?**
A: `backend/.env` - email sending happens on the server.

**Q: Can I share variables between frontend and backend?**
A: Only through API calls. Frontend calls backend APIs, but they use separate config files.

**Q: What if I only have one .env file?**
A: Create both files! They serve different purposes and both are required.

---

## 🔗 Related Documentation

- Email setup: `backend/EMAIL_SETUP.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`



