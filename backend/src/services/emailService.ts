/**
 * Email Service
 * Handles sending email notifications
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter
const createTransporter = () => {
  // Check if using Gmail (most common)
  if (process.env.SMTP_USER && process.env.SMTP_USER.includes("@gmail.com")) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use App Password, not regular password
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  // Check if using Ethereal Email for testing
  if (process.env.ETHEREAL_EMAIL_USER && process.env.ETHEREAL_EMAIL_PASS) {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_EMAIL_USER,
        pass: process.env.ETHEREAL_EMAIL_PASS,
      },
    });
  }

  // Custom SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: parseInt(process.env.SMTP_TIMEOUT || "10000"), // Default 10 seconds
      greetingTimeout: parseInt(process.env.SMTP_TIMEOUT || "10000"),
      socketTimeout: parseInt(process.env.SMTP_TIMEOUT || "10000"),
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
      },
    });
  }

  // Default to Gmail if SMTP_USER is set but no host specified
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  // No configuration found
  return null;
};

/**
 * Send an email notification
 */
export async function sendEmailNotification(
  options: EmailOptions
): Promise<void> {
  try {
    // Debug: Check if environment variables are loaded
    console.log("\nEmail Service Debug:");
    console.log(
      "   SMTP_USER:",
      process.env.SMTP_USER ? `Found (${process.env.SMTP_USER})` : "Not found"
    );
    console.log(
      "   SMTP_PASS:",
      process.env.SMTP_PASS ? "Found (****)" : "Not found"
    );
    console.log(
      "   SMTP_FROM:",
      process.env.SMTP_FROM
        ? `Found (${process.env.SMTP_FROM})`
        : "Not found - will use SMTP_USER or default"
    );
    console.log(
      "   SMTP_HOST:",
      process.env.SMTP_HOST
        ? `Found (${process.env.SMTP_HOST})`
        : "Not found - will use Gmail default"
    );
    console.log(
      "   SMTP_PORT:",
      process.env.SMTP_PORT
        ? `Found (${process.env.SMTP_PORT})`
        : "Not found - will use default (587)"
    );
    console.log("   Email will be sent to:", options.to);
    console.log("   Subject:", options.subject);

    const transporter = createTransporter();

    if (transporter) {
      console.log("   Transporter: Created successfully");
      // Log which configuration is being used
      if (process.env.SMTP_HOST) {
        console.log(
          `   Using custom SMTP: ${process.env.SMTP_HOST}:${
            process.env.SMTP_PORT || "587"
          }`
        );
      } else if (process.env.SMTP_USER?.includes("@gmail.com")) {
        console.log("   Using Gmail SMTP: smtp.gmail.com:587");
      } else {
        console.log("   Using default Gmail SMTP configuration");
      }
    } else {
      console.log("   Transporter: Failed to create");
    }

    // If email service is not configured, log and skip
    if (!transporter) {
      console.log(
        "\nEmail service not configured. Skipping email notification."
      );
      console.log("Email would be sent to:", options.to);
      console.log("Subject:", options.subject);
      console.log("\nTo configure email service:");
      console.log("   1. Create backend/.env or backend/.env.local file");
      console.log("   2. Add: SMTP_USER=your-email@gmail.com");
      console.log("   3. Add: SMTP_PASS=your-app-password");
      console.log("   4. Restart backend server");
      console.log("   See backend/EMAIL_SETUP.md for detailed instructions\n");
      return;
    }

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "BreachEye <noreply@breacheye.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    console.log("   Attempting to send email...");

    // Retry logic for sending email (up to 2 retries)
    let lastError: Error | null = null;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`   Retry attempt ${attempt - 1}/${maxRetries}...`);
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }

        // Verify connection before sending (only on first attempt)
        if (attempt === 1) {
          try {
            await transporter.verify();
            console.log("   SMTP connection verified successfully");
          } catch (verifyError) {
            console.warn(
              "   SMTP verification failed, but attempting to send anyway:",
              verifyError
            );
            // Don't throw - sometimes verify fails but sendMail works
          }
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to}`);
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Response: ${info.response}`);

        // Show preview URL for Ethereal Email (testing)
        if (process.env.ETHEREAL_EMAIL_USER) {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          if (previewUrl) {
            console.log(`Preview URL: ${previewUrl}`);
          }
        }

        return; // Success, exit function
      } catch (sendError) {
        lastError =
          sendError instanceof Error ? sendError : new Error(String(sendError));
        console.error(`   Attempt ${attempt} failed:`, lastError.message);

        // If it's a timeout and we have retries left, continue
        if (
          attempt <= maxRetries &&
          (lastError.message.includes("timeout") ||
            lastError.message.includes("ETIMEDOUT"))
        ) {
          continue;
        }
        // Otherwise, throw the error
        throw lastError;
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Failed to send email after retries");
  } catch (error) {
    console.error("Error sending email notification:", error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      if (
        error.message.includes("Invalid login") ||
        error.message.includes("Authentication failed")
      ) {
        console.error("   → Check your Gmail App Password is correct");
        console.error(
          "   → Make sure 2-Step Verification is enabled on your Google Account"
        );
        console.error(
          "   → Generate a new App Password at: https://myaccount.google.com/apppasswords"
        );
      } else if (error.message.includes("self signed certificate")) {
        console.error(
          "   → SSL certificate issue. Try setting SMTP_SECURE=false"
        );
      } else if (
        error.message.includes("Connection timeout") ||
        error.message.includes("ETIMEDOUT")
      ) {
        console.error("   → Connection timeout. Possible issues:");
        console.error("      - Gmail SMTP may be blocking the connection");
        console.error(
          "      - Check if 'Less secure app access' is enabled (deprecated)"
        );
        console.error(
          "      - Ensure you're using an App Password (not regular password)"
        );
        console.error(
          "      - Try using SMTP_HOST=smtp.gmail.com and SMTP_PORT=587 explicitly"
        );
        console.error("      - Check firewall/network restrictions");
        console.error(
          "      - For Vercel/deployed apps, Gmail may require OAuth2 instead of App Passwords"
        );
      } else {
        console.error("   → Full error details:", error);
      }
    }
    // Don't throw - we don't want email failures to break the notification system
  }
}

/**
 * Generate breach notification email HTML
 */
export function generateBreachNotificationEmail(
  email: string,
  breachCount: number,
  breachNames: string[]
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #e0e0e0; 
            margin: 0; 
            padding: 0; 
            background-color: #0a0a0a;
          }
          .email-wrapper {
            max-width: 700px; 
            margin: 0 auto; 
            background: #1a1a1a;
          }
          .header { 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
            color: #ffffff; 
            padding: 50px 40px; 
            text-align: center; 
            border-bottom: 4px solid #D4AF37;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
          }
          .content { 
            padding: 40px; 
            background: #1a1a1a;
            color: #e0e0e0;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #D4AF37;
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #D4AF37;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 16px;
          }
          .alert-box {
            background: linear-gradient(135deg, #2a1f0a 0%, #1a1508 100%);
            border-left: 5px solid #D4AF37;
            padding: 25px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .alert-box strong {
            display: block;
            color: #D4AF37;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .alert-box p {
            margin: 0;
            color: #e0e0e0;
            font-size: 14px;
            line-height: 1.6;
          }
          .breach-count-badge {
            display: inline-block;
            background: linear-gradient(135deg, #c62828 0%, #d32f2f 100%);
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 15px;
            margin: 0 4px;
            border: 1px solid #ff5252;
            box-shadow: 0 1px 4px rgba(198, 40, 40, 0.3);
            letter-spacing: 0.3px;
            vertical-align: baseline;
          }
          .breach-list {
            background: #0a0a0a;
            border: 1px solid #D4AF37;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
          }
          .breach-list-title {
            color: #D4AF37;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #2a2a2a;
          }
          .breach-list ul {
            margin: 0;
            padding-left: 20px;
            list-style: none;
          }
          .breach-list li {
            padding: 12px 0;
            border-bottom: 1px solid #2a2a2a;
            color: #e0e0e0;
            font-size: 14px;
            position: relative;
            padding-left: 25px;
          }
          .breach-list li:last-child {
            border-bottom: none;
          }
          .breach-list li:before {
            content: "•";
            color: #D4AF37;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 20px;
          }
          .breach-list li strong {
            color: #ffffff;
            font-weight: 600;
          }
          .action-section {
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
          }
          .action-section strong {
            display: block;
            color: #D4AF37;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .action-section-description {
            color: #888;
            font-size: 13px;
            margin-bottom: 15px;
            font-style: italic;
          }
          .action-section ul {
            margin: 0;
            padding-left: 20px;
            list-style: none;
          }
          .action-section li {
            padding: 10px 0;
            padding-left: 25px;
            color: #e0e0e0;
            font-size: 14px;
            position: relative;
            border-bottom: 1px solid #1a1a1a;
          }
          .action-section li:last-child {
            border-bottom: none;
          }
          .action-section li:before {
            content: "→";
            color: #D4AF37;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: #1a1a1a; 
            color: #D4AF37; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 2px solid #D4AF37;
            transition: all 0.3s;
            margin: 30px 0;
          }
          .button:hover {
            background: #D4AF37;
            color: #1a1a1a;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 30px;
            border-top: 2px solid #2a2a2a;
            color: #888; 
            font-size: 12px; 
            line-height: 1.8;
          }
          .footer p {
            margin: 4px 0;
          }
          .email-highlight {
            color: #D4AF37;
            font-weight: 600;
            background: #2a1f0a;
            padding: 2px 6px;
            border-radius: 3px;
          }
          @media only screen and (max-width: 600px) {
            .content { padding: 25px 20px; }
            .header { padding: 35px 25px; }
            .header h1 { font-size: 26px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Breach Alert</h1>
          </div>
          <div class="content">
            <h2 class="section-title">Security Notice</h2>
            <p style="font-size: 15px; line-height: 1.8; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.8; margin-bottom: 20px;">
              We've detected that your monitored email address <span class="email-highlight">${email}</span> has been involved in <span class="breach-count-badge">${breachCount}</span> data breach${
    breachCount > 1 ? "es" : ""
  }.
            </p>
            
            <div class="alert-box">
              <strong>Immediate Action Recommended</strong>
              <p>Your email address has been exposed in the following breach${
                breachCount > 1 ? "es" : ""
              }. Please take immediate action to secure your accounts.</p>
            </div>

            <div class="breach-list">
              <div class="breach-list-title">Affected Services & Platforms</div>
              <ul>
                ${breachNames
                  .map((name) => `<li><strong>${name}</strong></li>`)
                  .join("")}
              </ul>
            </div>

            <div class="action-section">
              <strong>Recommended Actions</strong>
              <div class="action-section-description">Follow these steps to secure your accounts and protect your information:</div>
              <ul>
                <li>Change your password immediately if you used this email for that service</li>
                <li>Enable two-factor authentication where possible</li>
                <li>Monitor your accounts for suspicious activity</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>

            <div class="cta-section">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/dashboard" class="button">View Details</a>
            </div>

            <div class="footer">
              <p>This is an automated security alert from BreachEye.</p>
              <p>Stay safe and secure!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate monthly summary email HTML (Enhanced Report Format)
 */
export function generateMonthlySummaryEmail(
  totalEmails: number,
  safeEmails: number,
  breachedEmails: number,
  totalBreaches: number,
  emailDetails: Array<{
    email: string;
    status: "safe" | "breached";
    breaches: number;
    lastChecked: Date;
  }>,
  monthName: string
): string {
  const formatDate = (date: Date) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const emailRows = emailDetails
    .map(
      (email) => `
      <tr style="border-bottom: 1px solid #2a2a2a;">
        <td style="padding: 14px 12px; color: #e0e0e0; font-weight: 500;">${
          email.email
        }</td>
        <td style="padding: 14px 12px;">
          <span style="padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${
            email.status === "safe"
              ? "background: #0f1a0a; color: #4caf50; border: 1px solid #4caf50;"
              : "background: #2a0f0a; color: #ef5350; border: 1px solid #ef5350;"
          }">
            ${email.status === "safe" ? "Safe" : "Breached"}
          </span>
        </td>
        <td style="padding: 14px 12px; text-align: center;">
          <span style="color: ${
            email.breaches > 0 ? "#ef5350" : "#4caf50"
          }; font-weight: 700; font-size: 16px;">${email.breaches}</span>
        </td>
        <td style="padding: 14px 12px; color: #888; font-size: 13px;">${formatDate(
          email.lastChecked
        )}</td>
      </tr>
    `
    )
    .join("");

  // Calculate percentages for visualization
  const safePercentage =
    totalEmails > 0 ? Math.round((safeEmails / totalEmails) * 100) : 0;
  const breachedPercentage =
    totalEmails > 0 ? Math.round((breachedEmails / totalEmails) * 100) : 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #e0e0e0; 
            margin: 0; 
            padding: 0; 
            background-color: #0a0a0a;
          }
          .email-wrapper {
            max-width: 800px; 
            margin: 0 auto; 
            background: #1a1a1a;
          }
          .header { 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
            color: #ffffff; 
            padding: 50px 40px; 
            text-align: center; 
            border-bottom: 4px solid #D4AF37;
          }
          .header h1 { 
            margin: 0 0 8px 0; 
            font-size: 32px; 
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
          }
          .header .subtitle {
            margin: 0;
            font-size: 16px;
            color: #D4AF37;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .content { 
            padding: 40px; 
            background: #1a1a1a;
            color: #e0e0e0;
          }
          .report-section {
            margin-bottom: 35px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #D4AF37;
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #D4AF37;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .stats-container {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 25px 0;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            overflow: hidden;
          }
          .stat-box {
            display: table-cell;
            width: 25%;
            padding: 25px 20px;
            text-align: center;
            vertical-align: top;
            border-right: 1px solid #2a2a2a;
            background: #0a0a0a;
          }
          .stat-box:last-child {
            border-right: none;
          }
          .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            font-weight: 600;
            margin-bottom: 12px;
            display: block;
          }
          .stat-value {
            font-size: 36px;
            font-weight: 700;
            margin: 0;
            line-height: 1;
          }
          .stat-box.total .stat-value { color: #D4AF37; }
          .stat-box.safe .stat-value { color: #4caf50; }
          .stat-box.breached .stat-value { color: #ef5350; }
          .stat-box.breaches .stat-value { color: #ff9800; }
          .progress-bar-container {
            background: #0a0a0a;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
            margin: 20px 0;
            border: 1px solid #2a2a2a;
          }
          .progress-bar {
            height: 100%;
            border-radius: 5px;
            transition: width 0.3s ease;
            display: inline-block;
          }
          .progress-bar.safe {
            background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
          }
          .progress-bar.breached {
            background: linear-gradient(90deg, #ef5350 0%, #e57373 100%);
          }
          .status-banner {
            padding: 20px 25px;
            border-radius: 6px;
            margin: 25px 0;
            border-left: 5px solid;
          }
          .status-banner.warning {
            background: linear-gradient(135deg, #2a1f0a 0%, #1a1508 100%);
            border-left-color: #D4AF37;
          }
          .status-banner.success {
            background: linear-gradient(135deg, #0f1a0a 0%, #0a1508 100%);
            border-left-color: #4caf50;
          }
          .status-banner p {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #e0e0e0;
          }
          .status-banner strong {
            font-weight: 700;
            display: block;
            margin-bottom: 6px;
            font-size: 15px;
            color: #D4AF37;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-banner.success strong {
            color: #4caf50;
          }
          .email-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            overflow: hidden;
          }
          .email-table thead {
            background: #1a1a1a;
            color: #ffffff;
          }
          .email-table th {
            padding: 16px 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
            color: #D4AF37;
          }
          .email-table tbody tr {
            border-bottom: 1px solid #2a2a2a;
          }
          .email-table tbody tr:last-child {
            border-bottom: none;
          }
          .email-table tbody tr:nth-child(even) {
            background: #0f0f0f;
          }
          .email-table tbody td {
            color: #e0e0e0;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #0a0a0a 0%, #050505 100%);
            border-radius: 8px;
            border: 1px solid #2a2a2a;
          }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: #1a1a1a; 
            color: #D4AF37; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 2px solid #D4AF37;
            transition: all 0.3s;
          }
          .button:hover {
            background: #D4AF37;
            color: #1a1a1a;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 30px;
            border-top: 2px solid #2a2a2a;
            color: #888; 
            font-size: 12px; 
            line-height: 1.8;
          }
          .footer strong {
            color: #D4AF37;
            font-weight: 700;
            display: block;
            margin-bottom: 8px;
          }
          .footer p {
            margin: 4px 0;
          }
          @media only screen and (max-width: 600px) {
            .content { padding: 25px 20px; }
            .stat-box { 
              display: block; 
              width: 100%; 
              border-right: none;
              border-bottom: 1px solid #2a2a2a;
            }
            .stat-box:last-child {
              border-bottom: none;
            }
            .email-table {
              font-size: 12px;
            }
            .email-table th,
            .email-table td {
              padding: 10px 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Monthly Security Summary</h1>
            <p class="subtitle">${monthName} Report</p>
          </div>
          <div class="content">
            <div class="report-section">
              <h2 class="section-title">Executive Summary</h2>
              
              <div class="stats-container">
                <div class="stat-box total">
                  <span class="stat-label">Total Emails</span>
                  <p class="stat-value">${totalEmails}</p>
                </div>
                <div class="stat-box safe">
                  <span class="stat-label">Safe Emails</span>
                  <p class="stat-value">${safeEmails}</p>
                </div>
                <div class="stat-box breached">
                  <span class="stat-label">Breached Emails</span>
                  <p class="stat-value">${breachedEmails}</p>
                </div>
                <div class="stat-box breaches">
                  <span class="stat-label">Total Breaches</span>
                  <p class="stat-value">${totalBreaches}</p>
                </div>
              </div>

              ${
                totalEmails > 0
                  ? `
              <div style="margin-top: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #888;">
                  <span>Security Status Distribution</span>
                  <span>Safe: ${safePercentage}% | Breached: ${breachedPercentage}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar safe" style="width: ${safePercentage}%;"></div>
                  <div class="progress-bar breached" style="width: ${breachedPercentage}%;"></div>
                </div>
              </div>
              `
                  : ""
              }
            </div>

            <div class="report-section">
              ${
                totalBreaches > 0
                  ? `
              <div class="status-banner warning">
                <p>
                  <strong>Action Required</strong>
                  ${totalBreaches} data breach${
                      totalBreaches > 1 ? "es" : ""
                    } detected across your monitored email addresses. Please review the details below and take appropriate action to secure your accounts.
                </p>
              </div>
              `
                  : `
              <div class="status-banner success">
                <p>
                  <strong>All Clear</strong>
                  No breaches detected this month. Your email addresses appear to be secure. Continue monitoring to stay protected.
                </p>
              </div>
              `
              }
            </div>

            <div class="report-section">
              <h2 class="section-title">Monitored Email Details</h2>
              <table class="email-table">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th style="text-align: center;">Breaches</th>
                    <th>Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  ${emailRows}
                </tbody>
              </table>
            </div>

            <div class="cta-section">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/monthlySummary" class="button">View Full Report</a>
            </div>

            <div class="footer">
              <p><strong>BreachEye Security Monitoring</strong></p>
              <p>This is an automated monthly security summary report.</p>
              <p>Generated on ${new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}</p>
              <p style="margin-top: 20px; color: #999; font-size: 11px;">
                You're receiving this email because monthly summary notifications are enabled in your account settings.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
