# Certificate System Documentation

## Overview

The RoadmapCareers platform now includes a comprehensive certificate system that generates professional, downloadable certificates for users who successfully complete the Remote Work Professional Certification exam.

## Features

### 1. Certificate Generation
- **Automatic Generation**: Certificates are automatically generated when a user passes the exam (score ≥ 60%)
- **Unique Certificate ID**: Each certificate receives a unique identifier in format `RC-TIMESTAMP-RANDOM`
- **Professional Design**: Old-school, classic certificate design with:
  - Decorative borders and ornaments
  - Professional typography
  - Official seals
  - Signature lines
  - Verification footer

### 2. Certificate Download
- **PDF Export**: Users can download their certificate as a high-quality PDF
- **Print-Ready**: Certificate is formatted for A4 landscape printing
- **High Resolution**: Uses 2x scale for crisp printing

### 3. Certificate Sharing
- **Web Share API**: Native sharing on supported devices
- **Clipboard Fallback**: Automatic clipboard copy for devices without share support
- **Shareable Link**: Includes verification URL for employers

### 4. Certificate Verification
- **Public Verification Page**: Available at `/verify-certificate`
- **Real-time Verification**: Instant certificate validation via backend API
- **Detailed Information**: Shows certificate holder, issue date, score, and status
- **Fraud Prevention**: Only displays certificates that are both passed and payment completed

## Technical Implementation

### Frontend Components

#### Certificate.jsx
Main certificate component with:
- Visual certificate design
- PDF download functionality (using jsPDF and html2canvas)
- Share functionality
- Professional layout matching old-school certificates

#### CertificationExam.jsx
Updated to:
- Generate certificate ID on exam completion
- Display certificate for passed exams
- Pass certificate data to Certificate component

#### CertificateVerification.jsx
Standalone verification page with:
- Certificate ID input
- Real-time API verification
- Detailed certificate information display
- Status indicators (valid/invalid)

### Backend API

#### Endpoints

**POST `/api/certifications/exam-result`**
- Saves exam results with certificate ID
- Generates unique certificate ID for passed exams
- Returns token and certificate ID

**GET `/api/certifications/verify/:certificateId`**
- Verifies certificate by ID
- Returns certificate details if valid
- Only shows paid and passed certificates

#### Database Schema (Google Sheets)

Certifications sheet columns:
1. Timestamp
2. Email
3. Full Name
4. Phone
5. Job Title
6. Job Company
7. Score
8. Total Questions
9. Passed (TRUE/FALSE)
10. Payment Status
11. Token
12. **Certificate ID** (now generated on exam completion)
13. Job Pay
14. Job Location
15. Job Type

### Dependencies

**Frontend:**
- `jspdf`: PDF generation
- `html2canvas`: HTML to canvas conversion for PDF export

**Backend:**
- Existing Google Sheets integration
- crypto module for ID generation

## User Flow

1. **Take Exam**: User completes certification exam
2. **Pass Exam**: If score ≥ 60%, certificate ID is generated
3. **View Certificate**: Professional certificate displayed with user details
4. **Download PDF**: Click "Download Certificate" to get PDF
5. **Share**: Click "Share Certificate" to share verification link
6. **Verify**: Anyone can verify certificate at `/verify-certificate`

## Certificate ID Format

Format: `RC-TIMESTAMP-RANDOM`
- `RC`: RoadmapCareers prefix
- `TIMESTAMP`: Base36 encoded timestamp (uppercase)
- `RANDOM`: 6-8 character random string (uppercase)

Example: `RC-L5X8K9PQ-A7B3C9`

## Verification Process

1. User or employer visits `/verify-certificate`
2. Enters certificate ID
3. System queries backend API
4. Backend checks Google Sheets for matching ID
5. Returns certificate details if:
   - Certificate exists
   - Exam was passed
   - Payment is completed
6. Displays verification result with full details

## Security Features

- Certificate IDs are cryptographically random
- Verification only works for paid, passed exams
- Certificate data stored securely in Google Sheets
- No sensitive data exposed in certificate design
- Verification URL included on certificate for easy validation

## Customization

The certificate design can be customized by editing `Certificate.jsx`:
- Border styles and colors
- Typography and fonts
- Seal design
- Layout and spacing
- Decorative elements

## Future Enhancements

Potential improvements:
- QR code on certificate linking to verification page
- Multiple certificate templates
- Certificate expiration dates (if needed)
- Batch verification for employers
- Certificate revocation system
- Email delivery of PDF certificate
- Social media sharing integrations (LinkedIn, Twitter)

## Testing

To test the certificate system:

1. **Take Exam**: Navigate to `/certification`
2. **Pass with ≥60%**: Ensure score of 12+ out of 20
3. **View Certificate**: Should see professional certificate design
4. **Download PDF**: Test PDF generation and quality
5. **Share**: Test share functionality
6. **Verify**: Copy certificate ID and test at `/verify-certificate`

## Support

For issues or questions about the certificate system:
- Check browser console for errors
- Ensure backend API is running
- Verify Google Sheets permissions
- Test PDF download on different browsers
- Confirm jsPDF and html2canvas are installed
