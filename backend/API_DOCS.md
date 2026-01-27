# RoadmapCareers API Documentation

Base URL: `http://localhost:3000/api`

## Table of Contents
- [Jobs API](#jobs-api)
- [Certifications API](#certifications-api)
- [Payments API](#payments-api)
- [Email API](#email-api)
- [Assessment API](#assessment-api)

---

## Jobs API

Base URL: `/api/jobs`

### 1. Get All Jobs
Get all jobs from your Google Sheet.

```bash
GET /api/jobs
```

**Example:**
```bash
curl http://localhost:3000/api/jobs
```

**Response:**
```json
{
  "success": true,
  "count": 23,
  "jobs": [
    {
      "jobId": "arbeitnow_123",
      "title": "Customer Service Representative",
      "company": "Example Corp",
      "description": "...",
      "requirements": "...",
      "salaryRange": "Not specified",
      "location": "Remote",
      "originalUrl": "https://...",
      "contactEmail": "youremail@example.com",
      "datePosted": "2026-01-24",
      "dateScraped": "2026-01-24",
      "status": "active",
      "source": "Arbeitnow",
      "category": "Customer Service"
    }
  ]
}
```

---

### 2. Fetch New Jobs
Automatically fetch new jobs from all APIs and add to your sheet.

```bash
POST /api/jobs/fetch
Content-Type: application/json
```

**Body (optional):**
```json
{
  "limit": 20
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/jobs/fetch \
  -H "Content-Type: application/json" \
  -d '{"limit": 20}'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 15 new jobs",
  "added": 15,
  "duplicates": 5
}
```

---

### 3. Add Job Manually
Add a single job manually to your sheet.

```bash
POST /api/jobs
Content-Type: application/json
```

**Body (required fields):**
```json
{
  "title": "Virtual Assistant",
  "company": "Your Company",
  "originalUrl": "https://example.com/job",
  "description": "Job description here",
  "requirements": "Requirements here",
  "salaryRange": "$30-40/hour",
  "location": "Remote",
  "category": "Admin"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Virtual Assistant",
    "company": "My Company",
    "originalUrl": "https://example.com/job",
    "description": "Help with admin tasks",
    "salaryRange": "$25/hour"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Job added successfully",
  "added": 1
}
```

---

## Job Sources

Currently fetching from:
- ✅ **Remotive** (free, no key required)
- ✅ **Arbeitnow** (free, no key required) - **Best for non-technical jobs!**
- ⚠️ RemoteOK (free, currently has date parsing issues)
- 🔒 Adzuna (optional, requires API key)
- 🔒 JSearch (optional, requires RapidAPI key)

## Filter Settings

Only fetches:
- ✅ Non-technical roles (filters out developers, engineers, etc.)
- ✅ Entry-level positions (customer service, admin, sales, etc.)

---

## Certifications API

Base URL: `/api/certifications`

### 1. Save Exam Result

Save a user's exam result after completing the certification exam.

```bash
POST /api/certifications/exam-result
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "555-1234",
  "jobTitle": "Customer Service Rep",
  "jobCompany": "Remote Corp",
  "score": 15,
  "totalQuestions": 20,
  "passed": true,
  "jobPay": "$15/hour",
  "jobLocation": "Remote",
  "jobType": "Entry Level"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123def456...",
  "message": "Exam result saved successfully"
}
```

### 2. Get Exam Result by Token

Retrieve exam result using the unique token.

```bash
GET /api/certifications/exam-result/:token
```

**Response:**
```json
{
  "timestamp": "2026-01-25T10:30:00.000Z",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "555-1234",
  "jobTitle": "Customer Service Rep",
  "jobCompany": "Remote Corp",
  "score": 15,
  "totalQuestions": 20,
  "passed": true,
  "paymentStatus": "pending",
  "token": "abc123def456...",
  "certificateId": "",
  "jobPay": "$15/hour",
  "jobLocation": "Remote",
  "jobType": "Entry Level"
}
```

### 3. Update Payment Status

Update payment status (called after successful payment).

```bash
POST /api/certifications/payment/:token
Content-Type: application/json
```

**Body:**
```json
{
  "paymentStatus": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "certificateId": "RC-ABC123-XYZ789",
  "message": "Payment status updated successfully"
}
```

### 4. Check Email Status

Check if an email has already completed the certification.

```bash
GET /api/certifications/check-email/:email
```

**Response:**
```json
{
  "hasPassed": true
}
```

---

## Payments API

Base URL: `/api/payments`

### 1. Create Checkout Session

Create a Stripe checkout session for certificate purchase.

```bash
POST /api/payments/create-checkout-session
Content-Type: application/json
```

**Body:**
```json
{
  "token": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/pay/cs_test_abc123..."
}
```

**Notes:**
- Validates that exam was passed
- Checks payment hasn't already been completed
- Returns URL to redirect user to Stripe Checkout

### 2. Verify Payment

Verify payment status after Stripe checkout.

```bash
POST /api/payments/verify
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "cs_test_abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "paid": true,
  "certificateId": "RC-ABC123-XYZ789",
  "message": "Payment verified successfully"
}
```

### 3. Get Stripe Config

Get Stripe publishable key for frontend.

```bash
GET /api/payments/config
```

**Response:**
```json
{
  "publishableKey": "pk_test_abc123..."
}
```

### 4. Stripe Webhook

Handle Stripe webhook events (for production).

```bash
POST /api/payments/webhook
Content-Type: application/json
Stripe-Signature: [signature]
```

**Notes:**
- Used in production for real-time payment notifications
- Requires STRIPE_WEBHOOK_SECRET to be configured
- Automatically updates payment status on successful payment

---

## Email API

Base URL: `/api/email`

### Process Emails

Process inbox and send auto-replies to job inquiries.

```bash
POST /api/email/process
```

### Get Leads

Get all email leads from Google Sheets.

```bash
GET /api/email/leads
```

---

## Assessment API

Base URL: `/api/assessment`

### Complete Assessment

Save assessment completion data.

```bash
POST /api/assessment/complete
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "answers": { ... }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message here",
  "message": "Additional details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## Payment Integration

### Test Mode (FREE)

Use these test cards with Stripe:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`

### Production Costs

- **Testing**: 100% FREE
- **Production**: 2.9% + $0.30 per transaction
- For $9 certification: You pay ~$0.56, keep ~$8.44

---

## Setup Requirements

### Environment Variables

Required in backend `.env`:

```env
# Google Sheets
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (optional, for production)

# URLs
STRIPE_SUCCESS_URL=http://localhost:5173/certification/result
STRIPE_CANCEL_URL=http://localhost:5173/certification
```

See `STRIPE_SETUP_GUIDE.md` for complete setup instructions.

---

## Filter Settings

Only fetches:
- ✅ Non-technical roles (filters out developers, engineers, etc.)
- ✅ Entry-level positions (customer service, admin, sales, etc.)
