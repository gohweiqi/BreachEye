# BreachEye - An Email Breach Intelligence & Monitoring Platform
A web-based breach intelligence and monitoring platform that helps users identify compromised email accounts, assess exposure risks, and receive automated security alerts when new breaches are detected.
The system continuously monitors registered email addresses against external breach intelligence sources, analyzes exposure data, calculates risk scores, and provides actionable security insights to improve user awareness and cyber hygiene.

## Problem Statement
Data breaches expose millions of user credentials every year, often without users being aware that their information has been compromised.
Leaked email addresses can lead to account takeovers, credential stuffing attacks, phishing campaigns, identity theft, and other security risks.
**BreachEye** was developed to provide continuous breach monitoring and automated alerting, enabling users to identify potential exposures early and take proactive measures to secure their accounts.

### Key Features
**Breach Intelligence Monitoring**
- Continuous monitoring of registered email addresses
- Integration with external breach intelligence sources
- Detection of newly disclosed breach exposures
- Historical breach tracking and analysis

**Risk Assessment**
- Risk score calculation based on breach severity
- Exposure trend analysis
- Security insights and recommendations
- Breach statistics dashboard

**Alerting & Reporting**
- Automated breach notifications
- Monthly security summary reports
- Configurable email alert system
- Real-time dashboard updates upon detection

**User Experience**
- Multi-email monitoring support
- Interactive data visualization
- Responsive modern interface
- Secure authentication and account management

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


## Live Demo
Frontend:
[(https://breach-eye.vercel.app/)]
**Note:**
Backend monitoring services are currently unavailable in the public deployment due to external API subscription and infrastructure limitations. Source code, screenshots, and system architecture are available for evaluation.

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

**Terminal 2 - Start Frontend Server:**

```bash
cd frontend
npm run dev
```

#### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## License
This project is developed as part of a Final Year Project for educational purposes.

## Contributing
This is a Final Year Project repository. For questions or issues, please contact the project maintainer.

**Note**: This system integrates with the XposedOrNot API, which has a rate limit of 1 query per second. The backend includes automatic rate limiting to comply with these restrictions.
