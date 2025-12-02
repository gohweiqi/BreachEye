# Email Breach Detection System - Backend API

Backend API server for the Email Breach Detection System, integrating with the XposedOrNot API to check email addresses for data breaches.

## Features

- ✅ **Email Breach Checking** - Check if an email has been involved in known data breaches
- ✅ **Comprehensive Analytics** - Get detailed breach analytics including risk scores, breach history, and exposed data types
- ✅ **Risk Scoring** - Automatic calculation of risk scores based on breach data
- ✅ **Rate Limiting** - Built-in rate limiting to prevent API abuse
- ✅ **Security** - Helmet.js for security headers and CORS support

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls
- **XposedOrNot API** - External breach data source

## API Integration

This backend integrates with the [XposedOrNot API](https://xposedornot.com/api_doc) to:

- Check email addresses for breaches
- Retrieve comprehensive breach analytics
- Calculate risk scores based on breach data

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check

- **GET** `/health`
  - Check if the API server is running

### Breach Checking

#### Check Email Breach (Simple)

- **GET** `/api/breach/check/:email`
  - Check if an email has been breached
  - Returns: `{ success: boolean, breached: boolean, breaches: string[], breachCount: number }`

**Example:**

```bash
GET http://localhost:5000/api/breach/check/user@example.com
```

#### Get Breach Analytics

- **GET** `/api/breach/analytics/:email`
  - Get comprehensive breach analytics for an email
  - Returns detailed breach information, risk score, yearly history, and more

**Example:**

```bash
GET http://localhost:5000/api/breach/analytics/user@example.com
```

#### Check Email with Details (Combined)

- **POST** `/api/breach/check`
  - Body: `{ email: string }`
  - Returns combined breach check and analytics data

**Example:**

```bash
POST http://localhost:5000/api/breach/check
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "breached": true,
  "breachCount": 5,
  "riskScore": 82,
  "breaches": ["Breach1", "Breach2", ...],
  "latestIncident": "Credential dump · Jan 2024",
  "totalBreaches": 12,
  "yearHistory": [
    { "year": 2018, "count": 3 },
    { "year": 2019, "count": 5 }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Rate Limiting

The XposedOrNot API has a rate limit of **1 query per second**. This backend includes:

- Automatic rate limiting to comply with API restrictions
- Client-side rate limiting (100 requests per 15 minutes per IP)

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   └── breachController.ts
│   ├── routes/            # API routes
│   │   └── breachRoutes.ts
│   ├── services/          # Business logic & external API integration
│   │   └── xposedOrNotService.ts
│   └── server.ts          # Express server setup
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Environment Variables

| Variable       | Description                          | Default                 |
| -------------- | ------------------------------------ | ----------------------- |
| `PORT`         | Server port                          | `5000`                  |
| `NODE_ENV`     | Environment (development/production) | `development`           |
| `FRONTEND_URL` | Frontend URL for CORS                | `http://localhost:3000` |

## Notes

- The XposedOrNot API requires **1 second delay** between requests. This is handled automatically.
- Rate limiting is configured to prevent API abuse.
- All API responses follow a consistent JSON format.

## References

- [XposedOrNot API Documentation](https://xposedornot.com/api_doc)
- [XposedOrNot API Playground](https://xposedornot.com/api_doc)


