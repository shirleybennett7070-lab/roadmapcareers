# Certificate System Routes & Pages

## All Available Pages

### Main Certification Flow

1. **`/certification`** - Main certification page
   - View certification options
   - See pricing
   - Start the exam

2. **`/certification-prep`** - Study guide
   - All 50 exam questions
   - Correct answers marked
   - Explanations provided

3. **Exam (in `/certification`)** - Take the exam
   - 20 random questions from bank
   - 30-minute timer
   - Multiple choice format

4. **Certificate Display (in exam completion)** - View certificate
   - Shown after passing (≥60%)
   - Download PDF
   - Share certificate

### Certificate Support Pages

5. **`/certificate-example`** ⭐ NEW
   - Interactive preview of the certificate
   - Sample data (Alex Johnson)
   - Features and benefits
   - Testimonials
   - Download sample PDF
   - Call-to-action to take exam

6. **`/verify-certificate`** - Public verification
   - Enter certificate ID
   - Real-time verification
   - Shows certificate details
   - For employers and candidates

### Navigation

All certificate-related pages are linked in the Footer:
- Get Certified → `/certification`
- Certificate Preview → `/certificate-example`
- Verify Certificate → `/verify-certificate`
- Study Guide → `/certification-prep`

Links also appear in:
- Main certification page (link to example)
- Exam completion page (link to verification)
- Certificate component (share includes verification link)

## User Journeys

### Journey 1: Want to See Certificate First
1. Visit `/certificate-example`
2. View sample certificate
3. See features and benefits
4. Click "Take the Exam" → `/certification`
5. Take exam
6. Pass and receive real certificate

### Journey 2: Study Then Take Exam
1. Visit `/certification-prep`
2. Study all 50 questions
3. Click "Take the Certification Exam"
4. Take exam
5. Pass and receive certificate

### Journey 3: Direct to Exam
1. Visit `/certification`
2. Click "Get Certified"
3. Take exam immediately
4. Pass and receive certificate

### Journey 4: Verify Existing Certificate
1. Visit `/verify-certificate`
2. Enter certificate ID
3. View verification results
4. Share with employer

## Route Configuration

All routes are configured in `/frontend/src/App.jsx`:

```javascript
{currentPath.startsWith('/certification/result') ? (
  <CertificationResult />
) : currentPath === '/certification/prep' ? (
  <CertificationPrep />
) : currentPath === '/certificate-example' ? (
  <CertificateExample />    // ← NEW
) : currentPath === '/verify-certificate' ? (
  <CertificateVerification />
) : currentPath === '/certification' ? (
  <Certification />
) : ...}
```

## Marketing/SEO Recommendations

Use these pages for:
- **Landing Page**: `/certificate-example` - show what they'll get
- **Social Proof**: Include testimonials on example page
- **Conversion**: Multiple CTAs to take exam
- **Trust Building**: Public verification builds credibility
- **Lead Generation**: Collect emails before exam

## URL Parameters

### Certification Page
```
/certification?job=Customer%20Service&company=Acme&pay=$15-20/hr
```
Passes job context to certification flow

### Certification Prep
```
/certification-prep?job=Customer%20Service&company=Acme
```
Shows relevant job info in sidebar

## API Endpoints

### Backend Routes
- `POST /api/certifications/exam-result` - Save exam results
- `GET /api/certifications/exam-result/:token` - Get result by token
- `GET /api/certifications/verify/:certificateId` - Verify certificate
- `POST /api/certifications/payment/:token` - Update payment status
- `GET /api/certifications/check-email/:email` - Check if passed

## Component Dependencies

### Certificate.jsx
Dependencies:
- jspdf
- html2canvas
- User info object
- Exam result object
- Certificate ID

### CertificateExample.jsx
Dependencies:
- Certificate.jsx component
- Header.jsx
- Footer.jsx
- Sample data (hardcoded)

### CertificateVerification.jsx
Dependencies:
- Backend API running
- Header.jsx
- Footer.jsx

## Quick Links for Users

**Want to see what you'll get?**
→ `/certificate-example`

**Ready to study?**
→ `/certification-prep`

**Ready to take the exam?**
→ `/certification`

**Need to verify a certificate?**
→ `/verify-certificate`

## Footer Links Structure

```
Roadmap Careers
├── Company Info
├── Quick Links
│   ├── Get Certified (/certification)
│   ├── Certificate Preview (/certificate-example) ← NEW
│   ├── Verify Certificate (/verify-certificate)
│   └── Study Guide (/certification-prep)
└── For Employers
    ├── Verify Candidate Certificates (/verify-certificate)
    └── Bulk Verification (Coming Soon)
```

## Mobile Responsiveness

All pages are fully responsive:
- Certificate scales on mobile
- Buttons stack vertically
- Forms are touch-friendly
- PDF download works on mobile
- Share API works on mobile browsers

## Performance Notes

- Certificate generation: ~1-2 seconds
- PDF download: ~2-3 seconds (depending on device)
- Verification API: < 500ms typical
- All images are lazy-loaded
- No external font dependencies (using system fonts)
