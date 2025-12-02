# EmailBreachDetectionSystem

# Testing Guide - Email Breach Check Function

## Prerequisites

Before testing, ensure both servers are running:

### 1. Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:

```
🚀 Server is running on http://localhost:5000
📚 API Documentation: http://localhost:5000/health
🔍 Breach Check API: http://localhost:5000/api/breach/check/:email
```

**Keep this terminal open!** The backend must keep running.

### 2. Start Frontend Server

Open a **different** terminal and run:

```bash
cd frontend
npm run dev
```

You should see:

```
✓ Ready in X.Xs
○ Local:        http://localhost:3000
```

## Testing Steps

### Step 1: Verify Backend is Running

1. Open your browser
2. Go to: `http://localhost:5000/health`
3. You should see a JSON response like:
   ```json
   {
     "success": true,
     "message": "Email Breach Detection API is running",
     "timestamp": "2024-..."
   }
   ```

✅ If you see this, the backend is working!

### Step 2: Test Email Check on Landing Page

1. Open your browser
2. Go to: `http://localhost:3000`
3. You should see the landing page with the email input field

### Step 3: Test with a Sample Email

1. Enter an email address in the input field (e.g., `test@example.com`)
2. Click the "Check" button or press Enter
3. Wait for the results (may take 1-2 seconds due to rate limiting)

### Expected Results

#### If Email Has Breaches:

- ✅ Red warning box appears
- Shows breach count
- Displays risk score with progress bar
- Lists affected services
- Shows latest incident date

#### If Email Has No Breaches:

- ✅ Green success box appears
- Message: "No breaches found"
- Security tips displayed

#### If There's an Error:

- ⚠️ Red error box appears
- Clear error message explaining what went wrong
- Troubleshooting steps provided

## Testing Different Scenarios

### Test Case 1: Valid Email (No Breaches)

- **Input**: `newemail123@example.com`
- **Expected**: Green success message
- **Wait Time**: 1-2 seconds

### Test Case 2: Valid Email (With Breaches)

- **Input**: Any email that has been in known breaches
- **Expected**: Red warning with breach details
- **Wait Time**: 2-3 seconds (includes analytics)

### Test Case 3: Invalid Email Format

- **Input**: `notanemail`
- **Expected**: Red validation error below input
- **Message**: "Please enter a valid email address"

### Test Case 4: Empty Input

- **Input**: (nothing)
- **Expected**: Red validation error
- **Message**: "Please enter an email address"

## Browser Console Testing

To see detailed API calls:

1. Open browser DevTools (Press F12)
2. Go to the "Network" tab
3. Filter by "XHR" or "Fetch"
4. Try checking an email
5. You should see:
   - Request to: `http://localhost:5000/api/breach/check`
   - Method: POST
   - Status: 200 (if successful)

## Troubleshooting

### Error: "Unable to connect to the server"

**Check:**

1. ✅ Is the backend server running? (`npm run dev` in backend folder)
2. ✅ Can you access `http://localhost:5000/health`?
3. ✅ Check backend terminal for errors

**Fix:**

- Make sure backend is running in a separate terminal
- Check if port 5000 is available
- Verify `.env` file exists in backend folder

### Error: "Request timeout"

**Reason:** XposedOrNot API has rate limiting (1 query/second)

**Fix:**

- Wait a few seconds and try again
- This is normal behavior

### Error: CORS errors

**Check:**

- Backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Frontend is running on port 3000

**Fix:**

- Update backend `.env` if frontend runs on different port
- Restart backend server after changing `.env`

## Manual API Testing

You can also test the API directly using curl:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test breach check
curl -X POST http://localhost:5000/api/breach/check \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Success Indicators

✅ **Everything is working correctly if:**

- Backend server shows "Server is running" message
- Frontend loads without errors
- Email check returns results (either breaches or no breaches)
- No errors in browser console
- Network tab shows successful API calls

## Next Steps After Testing

Once everything works:

1. ✅ Test with different email addresses
2. ✅ Verify UI displays correctly
3. ✅ Check error handling with invalid inputs
4. ✅ Test loading states (button shows "Checking...")

Happy testing! 🚀
