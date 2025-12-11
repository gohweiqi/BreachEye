# Email Breach Detection System

A comprehensive web-based system that enables users to monitor multiple email addresses for data breaches, visualize breach statistics, and receive real-time alerts. This project helps users stay informed about their email security and take proactive action before threats escalate.

## Project Overview

**BreachEye** is a full-stack email breach detection and monitoring platform designed to empower users with email security awareness. The system integrates with trusted breach databases to check if email addresses have been compromised in known data breaches, providing detailed analytics, risk scoring, and actionable insights.

### Key Features

- ✅ Multi-email monitoring dashboard
- ✅ Real-time breach checking and alerts
- ✅ Risk score calculation based on breach data
- ✅ Interactive breach history visualization
- ✅ Email notification system (configurable)
- ✅ Monthly security summary reports
- ✅ Breach news feed integration
- ✅ Responsive and modern UI design

## Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **NextAuth.js** - Authentication

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (Mongoose)
- **XposedOrNot API** - External breach data source
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd EmailBreachDetectionSystem
```

#### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env.local` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/breacheye

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Service Configuration (Optional - for notifications)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Test Mode (Optional - for development)
ENABLE_TEST_MODE=false
```

**Note**: For MongoDB Atlas (cloud), use your connection string instead:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/breacheye
```

#### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note**: The `NEXTAUTH_SECRET` and Google OAuth credentials are only needed in the frontend `.env.local` file, not in the backend.

#### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Local MongoDB:**

```bash
# On macOS/Linux
mongosh

# On Windows
# MongoDB should start automatically as a service, or run:
mongosh
```

**MongoDB Atlas:**
No local setup needed - just ensure your connection string in `.env` is correct.

#### 5. Run the Application

**Terminal 1 - Start Backend Server:**

```bash
cd backend
npm run dev
```

You should see:

```
Server is running on http://localhost:5000
API Documentation: http://localhost:5000/health
Breach Check API: http://localhost:5000/api/breach/check/:email
Email Management API: http://localhost:5000/api/emails
```

**Terminal 2 - Start Frontend Server:**

```bash
cd frontend
npm run dev
```

You should see:

```
✓ Ready in X.Xs
○ Local:        http://localhost:3000
```

#### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Development

### Building for Production

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

### Environment Variables

Make sure to set up all required environment variables in both `backend/.env.local` and `frontend/.env.local` before running the application.

## License

This project is developed as part of a Final Year Project for educational purposes.

## Contributing

This is a Final Year Project repository. For questions or issues, please contact the project maintainer.

---

**Note**: This system integrates with the XposedOrNot API, which has a rate limit of 1 query per second. The backend includes automatic rate limiting to comply with these restrictions.
