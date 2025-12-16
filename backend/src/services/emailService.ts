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

type ResendErrorBody = {
  name?: string;
  message?: string;
  statusCode?: number;
};

type ResendResponseBody = {
  id?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Choose a safe "from" address.
 * IMPORTANT:
 * - You CANNOT use from: *@gmail.com in Resend (you don't own gmail.com).
 * - If you don't want to buy a domain, use onboarding@resend.dev.
 */
function resolveFromAddress(): string {
  // Use your preferred env var name
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM || // keep compatibility with your previous .env naming
    "";

  // If user set gmail.com by mistake, force fallback to resend.dev
  if (from.toLowerCase().includes("@gmail.com")) {
    console.warn(
      "[EmailService] EMAIL_FROM is gmail.com. Resend will reject it. Falling back to onboarding@resend.dev."
    );
    return "BreachEye <onboarding@resend.dev>";
  }

  // If they set something valid, use it
  if (from.trim()) return from.trim();

  // Default (no domain required)
  return "BreachEye <onboarding@resend.dev>";
}

/**
 * Optional reply-to (so user replies go to your Gmail)
 */
function resolveReplyTo(): string | undefined {
  const replyTo = process.env.REPLY_TO || process.env.EMAIL_REPLY_TO || "";
  return replyTo.trim() ? replyTo.trim() : undefined;
}

/**
 * Send an email via Resend.
 * NOTE: This is HTTP-based and works on hosted platforms (no SMTP needed).
 */
export async function sendEmailNotification(
  options: EmailOptions
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("\n[EmailService] ❌ RESEND_API_KEY missing!");
    console.error("Set RESEND_API_KEY in your environment variables.");
    console.error("Get your API key from: https://resend.com/api-keys");
    return;
  }

  const fromAddress = resolveFromAddress();
  const replyTo = resolveReplyTo();

  // Debug (do not print secrets)
  console.log("\n[EmailService] Resend Debug:");
  console.log("   RESEND_API_KEY: Found");
  console.log("   From:", fromAddress);
  if (replyTo) console.log("   Reply-To:", replyTo);
  console.log("   To:", options.to);
  console.log("   Subject:", options.subject);

  const payload: Record<string, any> = {
    from: fromAddress,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  };

  if (replyTo) payload.reply_to = replyTo;

  try {
    const response = await axios.post<ResendResponseBody>(
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

    console.log("[EmailService] ✅ Resend accepted email.");
    console.log("   ID:", response.data?.id ?? "N/A");
    console.log("   Queued for:", options.to);
  } catch (error: any) {
    const status = error?.response?.status;
    const body = error?.response?.data as ResendErrorBody | undefined;

    console.error("\n[EmailService] ❌ Resend send failed.");
    console.error("   Status:", status ?? "Unknown");
    console.error("   Response:", body ?? error?.message ?? error);

    // Friendly diagnostics
    if (
      status === 403 &&
      body?.message?.toLowerCase().includes("domain is not verified")
    ) {
      console.error(
        "\n[EmailService] Fix: Your FROM domain is not verified in Resend."
      );
      console.error("You cannot use '@gmail.com' as From in Resend.");
      console.error(
        "Solution (no domain purchase): set EMAIL_FROM to 'BreachEye <onboarding@resend.dev>'"
      );
      console.error(
        "Optional: set REPLY_TO='yourgmail@gmail.com' so replies go to you."
      );
    } else if (status === 401) {
      console.error("[EmailService] Fix: Invalid RESEND_API_KEY.");
    } else if (status === 422) {
      console.error(
        "[EmailService] Fix: Validation error. Check 'to' email format and your 'from' address."
      );
    } else if (status === 429) {
      console.error("[EmailService] Fix: Rate limited. Try again later.");
    }

    // Don't throw: keep system running even if email fails
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
 * Generate monthly summary email HTML
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
          .email-wrapper { max-width: 800px; margin: 0 auto; background: #1a1a1a; }
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            padding: 50px 40px;
            text-align: center;
            border-bottom: 4px solid #D4AF37;
          }
          .header h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #ffffff; }
          .header .subtitle {
            margin: 0;
            font-size: 16px;
            color: #D4AF37;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .content { padding: 40px; background: #1a1a1a; color: #e0e0e0; }
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
          .stat-box:last-child { border-right: none; }
          .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            font-weight: 600;
            margin-bottom: 12px;
            display: block;
          }
          .stat-value { font-size: 36px; font-weight: 700; margin: 0; line-height: 1; }
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
          .progress-bar { height: 100%; border-radius: 5px; display: inline-block; }
          .progress-bar.safe { background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%); }
          .progress-bar.breached { background: linear-gradient(90deg, #ef5350 0%, #e57373 100%); }

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
          .status-banner strong {
            font-weight: 700;
            display: block;
            margin-bottom: 6px;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-banner.warning strong { color: #D4AF37; }
          .status-banner.success strong { color: #4caf50; }

          .email-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            overflow: hidden;
          }
          .email-table thead { background: #1a1a1a; }
          .email-table th {
            padding: 16px 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
            color: #D4AF37;
          }
          .email-table tbody tr { border-bottom: 1px solid #2a2a2a; }
          .email-table tbody tr:last-child { border-bottom: none; }
          .email-table tbody tr:nth-child(even) { background: #0f0f0f; }
          .email-table tbody td { color: #e0e0e0; }

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
          @media only screen and (max-width: 600px) {
            .content { padding: 25px 20px; }
            .stat-box {
              display: block;
              width: 100%;
              border-right: none;
              border-bottom: 1px solid #2a2a2a;
            }
            .stat-box:last-child { border-bottom: none; }
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

            ${
              totalBreaches > 0
                ? `
              <div class="status-banner warning">
                <p>
                  <strong>Action Required</strong>
                  ${totalBreaches} data breach${
                    totalBreaches > 1 ? "es" : ""
                  } detected across your monitored email addresses. Please review the details below.
                </p>
              </div>
              `
                : `
              <div class="status-banner success">
                <p>
                  <strong>All Clear</strong>
                  No breaches detected this month. Continue monitoring to stay protected.
                </p>
              </div>
              `
            }

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
