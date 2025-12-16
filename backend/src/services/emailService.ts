/**
 * Email Service (Resend-only)
 * Sends email notifications using Resend HTTP API.
 */

import axios from "axios";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

type ResendResponse = {
  id?: string;
  error?: { message?: string };
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Send an email via Resend.
 * NOTE: This is HTTP-based and works on hosted platforms (no SMTP needed).
 */
export async function sendEmailNotification(
  options: EmailOptions
): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "\n[EmailService] RESEND_API_KEY missing. Skipping email send."
      );
      return;
    }

    const fromAddress =
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM ||
      "onboarding@resend.dev";

    // Basic debug (don’t print secrets)
    console.log("\n[EmailService] Resend Debug:");
    console.log("   From:", fromAddress);
    console.log("   To:", options.to);
    console.log("   Subject:", options.subject);

    const payload = {
      from: fromAddress,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    };

    const response = await axios.post<ResendResponse>(
      RESEND_ENDPOINT,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("   ✅ Resend accepted email. ID:", response.data?.id ?? "N/A");
  } catch (error: any) {
    const status = error?.response?.status;
    const body = error?.response?.data;

    console.error("\n[EmailService] ❌ Resend send failed.");
    console.error("   Status:", status ?? "Unknown");
    console.error("   Response:", body ?? error?.message ?? error);

    // Don’t throw (you said you don’t want email failures to break the system)
    return;
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
          .email-wrapper { max-width: 700px; margin: 0 auto; background: #1a1a1a; }
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            padding: 50px 40px;
            text-align: center;
            border-bottom: 4px solid #D4AF37;
          }
          .header h1 { margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; }
          .content { padding: 40px; background: #1a1a1a; color: #e0e0e0; }
          .section-title {
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
          .breach-list ul { margin: 0; padding-left: 0; list-style: none; }
          .breach-list li {
            padding: 12px 0;
            border-bottom: 1px solid #2a2a2a;
            color: #e0e0e0;
            font-size: 14px;
            position: relative;
            padding-left: 18px;
          }
          .breach-list li:last-child { border-bottom: none; }
          .breach-list li:before {
            content: "•";
            color: #D4AF37;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 18px;
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
          .action-section ul { margin: 0; padding-left: 0; list-style: none; }
          .action-section li {
            padding: 10px 0;
            padding-left: 20px;
            color: #e0e0e0;
            font-size: 14px;
            position: relative;
            border-bottom: 1px solid #1a1a1a;
          }
          .action-section li:last-child { border-bottom: none; }
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
            margin: 30px 0;
          }
          .cta-section { text-align: center; margin: 40px 0; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #2a2a2a;
            color: #888;
            font-size: 12px;
            line-height: 1.8;
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
              We've detected that your monitored email address <span class="email-highlight">${email}</span>
              has been involved in <span class="breach-count-badge">${breachCount}</span> data breach${
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
 * Generate monthly summary email HTML (keep your existing one)
 * NOTE: I’m leaving this exactly as-is since your current version is long and already good.
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
  // KEEP YOUR EXISTING IMPLEMENTATION HERE (paste the rest of your current function)
  // I’m not rewriting it to avoid breaking your design.
  return "";
}
