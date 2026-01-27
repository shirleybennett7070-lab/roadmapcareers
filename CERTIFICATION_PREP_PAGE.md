# Certification Exam Prep Page

## Overview
The Certification Prep Page allows users to study and practice for the Remote Work Professional Certification exam before taking the actual timed exam.

## Access Points
Users can access the prep page from:
1. **Certification Info Page** - Blue callout box with link to prep page
2. **Before Starting Exam** - Link in the exam details sidebar
3. **Direct URL**: `/certification/prep` (with optional job info query params)

## Features

### 1. Main Menu
- **Progress Dashboard**: Shows statistics
  - Questions studied count
  - Completion percentage
  - Total questions available
- **Two Study Modes**: Study Mode and Practice Test Mode
- **Job Details Sidebar**: Shows the job they're interested in (if coming from job page)

### 2. Study Mode (📚)
**Purpose**: Learn the material with instant feedback

**Features**:
- Review all 50 questions one by one
- No time pressure
- See correct answer immediately after selecting
- Detailed explanation for every question
- Navigate freely between questions
- Progress tracking (marks questions as "studied")
- Visual indicators for correct/incorrect answers

**Benefits**:
- ✓ Instant feedback on answers
- ✓ Detailed explanations for each question
- ✓ No time pressure
- ✓ Navigate freely between questions

### 3. Practice Test Mode (✍️)
**Purpose**: Simulate the real exam experience

**Features**:
- 20 random questions (same as real exam)
- Untimed practice
- Question navigator showing answered/unanswered
- Answer all questions before submitting
- Full results with:
  - Score and percentage
  - Detailed review of each answer
  - Correct answers shown for missed questions
  - Explanations for all questions
- Option to retake unlimited times

**Benefits**:
- ✓ 20 random questions (like the real exam)
- ✓ Untimed practice mode
- ✓ See results with correct answers
- ✓ Unlimited practice tests

## Layout Structure

### With Job Info (from job page)
```
┌─────────────────────────────────────────┐
│           Header                         │
├──────────┬──────────────────────────────┤
│ Sidebar  │    Main Content              │
│ (4 cols) │    (8 cols)                  │
│          │                               │
│ - Job    │  - Stats Dashboard           │
│   Info   │  - Study Mode Card           │
│ - Prog   │  - Practice Test Card        │
│   Stats  │  - About Exam Info           │
│ - Links  │                               │
└──────────┴──────────────────────────────┘
```

### Without Job Info (direct access)
```
┌─────────────────────────────────────────┐
│           Header                         │
├─────────────────────────────────────────┤
│         Main Content (12 cols)          │
│                                          │
│  - Stats Dashboard                      │
│  - Study Mode Card                      │
│  - Practice Test Card                   │
│  - About Exam Info                      │
└─────────────────────────────────────────┘
```

## Question Bank
- **Total Questions**: 50 questions with explanations
- **Exam Questions**: 20 random questions selected from the bank
- **Each Question Includes**:
  - Question text
  - 4 multiple-choice options
  - Correct answer index
  - Detailed explanation

## User Flow

### Study Flow
1. Click "Start Studying" from menu
2. Review question
3. Select an answer
4. Immediately see if correct/incorrect
5. Read explanation
6. Navigate to next question
7. Repeat until all questions studied

### Practice Test Flow
1. Click "Take Practice Test" from menu
2. Answer 20 random questions
3. Navigate freely between questions
4. Submit when all answered
5. View detailed results with:
   - Score and pass/fail indicator
   - Each question marked correct/incorrect
   - Correct answers shown
   - Explanations for all questions
6. Option to retake or take real exam

## Integration Points

### From Certification Page
- Added prep link in `CertificationInfo.jsx` component
- Blue callout box before "Get Certified" button
- Preserves job info in URL parameters

### From Exam Start Page
- Added prep link in exam details sidebar
- Located in `CertificationExam.jsx` component
- Accessible before starting timed exam

### To Real Exam
- Link from practice test results (if passed)
- Link from menu page
- Preserves job info context

## Technical Details

**Route**: `/certification/prep`

**Query Parameters** (optional):
- `job` - Job title
- `company` - Company name
- `pay` - Pay range
- `location` - Job location
- `type` - Job type

**Component**: `CertificationPrep.jsx`

**Dependencies**:
- `JobDetailsSidebar.jsx` - For job info display
- `Header.jsx` - Site header
- `Footer.jsx` - Site footer

**State Management**:
- Mode: 'menu', 'study', 'practice-test'
- Question tracking
- Answer tracking
- Progress tracking

## Benefits for Users

1. **Confidence Building**: Practice before the real exam
2. **Learning**: Study with explanations for better understanding
3. **Familiarity**: Get comfortable with question format
4. **No Pressure**: Study at their own pace
5. **Unlimited Practice**: Take as many practice tests as needed
6. **Better Success Rate**: Prepared users more likely to pass

## Future Enhancements (Optional)
- Timer mode for practice tests
- Bookmarking questions
- Filter by topic/category
- Performance analytics
- Downloadable study guide
- Mobile app version
