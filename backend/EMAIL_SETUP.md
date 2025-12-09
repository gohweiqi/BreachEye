# Email Service Configuration Guide

This guide will help you configure the email service to send notifications.

> ⚠️ **IMPORTANT**: All email configuration goes in `backend/.env` or `backend/.env.local` file, NOT `frontend/.env`!
>
> - ✅ Put SMTP credentials in: `backend/.env` OR `backend/.env.local`
> - ❌ Do NOT put them in: `frontend/.env`
>
> **Note**: The backend supports both `.env` and `.env.local` files. `.env.local` is typically gitignored and useful for local development.
>
> See `ENV_FILES_GUIDE.md` for a complete explanation of which file needs what.

## Option 1: Gmail (Recommended for Testing)

Gmail is the easiest option to get started. You'll need to create an **App Password**.

### Steps:

1. **Enable 2-Step Verification** (if not already enabled):

   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create an App Password**:

   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "BreachEye" as the name
   - Click "Generate"
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

3. **Add to your `backend/.env` file** (NOT frontend/.env):

   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM=BreachEye <your-email@gmail.com>
   ```

   ⚠️ **Important**: Put these in the **backend** folder's `.env` file, not the frontend one!

4. **Restart your backend server**

### Testing:

- Add a breached email to your monitored list
- You should receive an email at your Gmail address

---

## Option 2: Ethereal Email (Development Testing)

Ethereal Email creates temporary email accounts for testing. Perfect for development!

### Steps:

1. **Install Ethereal Email** (if not already):

   ```bash
   npm install -g ethereal-email
   ```

2. **Or use the online version**:

   - Go to [Ethereal Email](https://ethereal.email/)
   - Click "Create Account"
   - Copy the username and password

3. **Add to your `backend/.env` file** (NOT frontend/.env):

   ```env
   ETHEREAL_EMAIL_USER=your-ethereal-username
   ETHEREAL_EMAIL_PASS=your-ethereal-password
   NODE_ENV=development
   ```

   ⚠️ **Important**: Put these in the **backend** folder's `.env` file!

4. **Restart your backend server**

### Testing:

- When you send an email, check the console for a preview URL
- Click the preview URL to see the email in your browser

---

## Option 3: Custom SMTP (Production)

For production, you can use any SMTP service (SendGrid, Mailgun, AWS SES, etc.)

### Example: SendGrid

1. **Sign up for SendGrid** and get your API key

2. **Add to your `backend/.env` file** (NOT frontend/.env):

   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=BreachEye <noreply@yourdomain.com>
   ```

   ⚠️ **Important**: Put these in the **backend** folder's `.env` file!

### Example: Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
SMTP_FROM=BreachEye <noreply@yourdomain.com>
```

---

## Troubleshooting

### "Invalid login" error

- **Gmail**: Make sure you're using an App Password, not your regular password
- **Other**: Check your username and password are correct

### "Self signed certificate" error

- Add `SMTP_SECURE=false` to your `.env` file
- Or set `SMTP_PORT=587` (TLS) instead of `465` (SSL)

### Emails not sending

1. Check your `backend/.env` file has the correct variables
2. Make sure you're editing `backend/.env`, NOT `frontend/.env`
3. Restart your backend server after changing `.env`
4. Check the console logs for error messages
5. Verify your email service credentials are correct

### Gmail App Password not working

- Make sure 2-Step Verification is enabled
- Generate a new App Password
- Remove spaces from the password (it should be 16 characters without spaces)

---

## Environment Variables Reference

| Variable              | Description                           | Example                               |
| --------------------- | ------------------------------------- | ------------------------------------- |
| `SMTP_USER`           | Your email address or SMTP username   | `user@gmail.com`                      |
| `SMTP_PASS`           | Your email password or App Password   | `abcdefghijklmnop`                    |
| `SMTP_HOST`           | SMTP server hostname                  | `smtp.gmail.com`                      |
| `SMTP_PORT`           | SMTP server port                      | `587`                                 |
| `SMTP_SECURE`         | Use SSL/TLS                           | `false` (for TLS) or `true` (for SSL) |
| `SMTP_FROM`           | From email address                    | `BreachEye <noreply@breacheye.com>`   |
| `ETHEREAL_EMAIL_USER` | Ethereal Email username (for testing) | `ethereal-username`                   |
| `ETHEREAL_EMAIL_PASS` | Ethereal Email password (for testing) | `ethereal-password`                   |

---

## Quick Start (Gmail)

1. Enable 2-Step Verification on your Google Account
2. Create an App Password at https://myaccount.google.com/apppasswords
3. Add to `backend/.env` file (NOT frontend/.env):
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```
4. Restart backend server
5. Test by adding a breached email!

That's it! 🎉
