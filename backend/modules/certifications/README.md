# Certifications Module

Handles certification exam results, payments, and certificate generation.

## Setup

1. **Create a new Google Sheet** for certifications (or use a new tab in your existing sheet)
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "RoadmapCareers - Certifications"
   - Share it with your service account email (from credentials.json)

2. **Add Sheet ID to .env**
   ```bash
   CERTIFICATIONS_SHEET_ID=your_sheet_id_here
   ```
   Get the ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

3. **Run setup script**
   ```bash
   npm run setup-certifications
   ```

## API Endpoints

### Save Exam Result
```http
POST /api/certifications/exam-result
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "555-1234",
  "jobTitle": "Customer Service Rep",
  "jobCompany": "HouseSitter",
  "score": 18,
  "totalQuestions": 20,
  "passed": true,
  "jobPay": "$15-20/hr",
  "jobLocation": "Remote",
  "jobType": "Full-time"
}
```

Response:
```json
{
  "success": true,
  "token": "abc123...",
  "message": "Exam result saved successfully"
}
```

### Get Exam Result by Token
```http
GET /api/certifications/exam-result/:token
```

Response:
```json
{
  "timestamp": "2024-01-20T...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "score": 18,
  "totalQuestions": 20,
  "passed": true,
  "paymentStatus": "pending",
  "certificateId": ""
}
```

### Update Payment Status
```http
POST /api/certifications/payment/:token
Content-Type: application/json

{
  "paymentStatus": "completed"
}
```

Response:
```json
{
  "success": true,
  "certificateId": "RC-ABC123-XYZ",
  "message": "Payment status updated successfully"
}
```

### Check if Email Has Passed
```http
GET /api/certifications/check-email/:email
```

Response:
```json
{
  "hasPassed": true
}
```

## Sheet Structure

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | When the exam was completed |
| B | Email | User's email address |
| C | Full Name | User's full name |
| D | Phone | Phone number (optional) |
| E | Job Title | Role they were interested in |
| F | Job Company | Company name |
| G | Score | Exam score (0-20) |
| H | Total Questions | Always 20 |
| I | Passed | TRUE/FALSE |
| J | Payment Status | pending/completed |
| K | Token | Unique URL token |
| L | Certificate ID | Generated after payment |
| M | Job Pay | Salary range |
| N | Job Location | Remote/location |
| O | Job Type | Full-time/Part-time |

## Workflow

1. **User completes exam** → Frontend calls `POST /exam-result`
2. **Backend saves to sheet** → Returns unique token
3. **Frontend redirects** → `/certification/result/:token`
4. **User clicks "Get Certificate"** → Payment processing
5. **After payment** → Call `POST /payment/:token`
6. **Backend updates sheet** → Generates certificate ID
7. **Send email** → With certificate attached

## Security

- Each result has a unique token (64-char hex)
- Tokens are required to access results
- Only the person with the token can view their result
- Payment status prevents duplicate payments
