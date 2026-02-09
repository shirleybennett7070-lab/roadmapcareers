# Email Auto-Reply System Design

## Lead Stages

```
1. INQUIRY → Just emailed about a job
2. JOB_ID_REQUESTED → Asked them for job ID
3. JOB_ID_CONFIRMED → They provided job ID
4. QUIZ_SENT → Sent onboarding quiz link
5. QUIZ_COMPLETED → Finished the quiz
6. TRAINING_OFFERED → Sent training offer
7. PAID → Purchased training
8. DROPPED → Lost interest
```

## Database Schema

### Leads Table (Google Sheets)
```
- Email (unique)
- Name
- Job ID
- Stage
- First Contact Date
- Last Contact Date
- Quiz Score
- Payment Status
- Notes
```

## Email Parsing Logic

1. **Extract email address**
2. **Look for job ID patterns:**
   - "Job ID: XXX"
   - "Ref: XXX"
   - "Position ID: XXX"
   - Any ID from our jobs database
3. **Determine stage** based on conversation history
4. **Send appropriate response**

## Auto-Reply Templates

### Template 1: No Job ID Found
```
Subject: Re: Job Inquiry - Need More Info

Hi there!

Thanks for reaching out about our job posting! To help you get started, 
could you please provide the Job ID from the posting?

You can find it at the top of the job description.

Looking forward to helping you land this job!

Best,
RoadmapCareers Team
```

### Template 2: Job ID Confirmed
```
Subject: Re: [Job Title] - Next Steps

Hi [Name]!

Great! I've pulled up the [Job Title] position at [Company].

Before you apply, I'd like to help you prepare with our training program.

First step: Complete this quick assessment so we can personalize your training.

[Quiz Link]

This takes 5 minutes and helps us understand your background.

Ready to get started?

Best,
RoadmapCareers Team
```

## API Endpoints

```
POST /api/email/process - Process incoming emails
GET /api/leads - Get all leads
GET /api/leads/:email - Get specific lead
PUT /api/leads/:email/stage - Update lead stage
POST /api/email/send - Send email manually
```
