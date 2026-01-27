# Assessment Quiz Page Revamp

## Overview
The assessment page has been revamped to include a left sidebar component that displays job details when job information is passed via URL parameters.

## Changes Made

### 1. New Component: JobDetailsSidebar
**File:** `frontend/src/components/JobDetailsSidebar.jsx`

A new sidebar component that displays:
- Position/Role title
- Company name
- Compensation
- Location
- Employment type
- Assessment purpose info box

Features:
- Sticky positioning (stays visible while scrolling)
- Modern card design with borders and shadows
- Responsive layout (hides on mobile, shows on lg screens and up)
- Gracefully handles missing job information

### 2. Updated Component: Assessment
**File:** `frontend/src/components/Assessment.jsx`

Changes:
- Added `useEffect` hook to parse URL parameters for job information
- Implemented two-column grid layout (4 columns for sidebar, 8 columns for main content)
- Sidebar only shows when job info exists and user is past the contact stage
- Responsive design that adapts to screen size

## URL Parameters

The assessment page now accepts the following URL parameters:

- `title` or `job` - Job title/position
- `company` - Company name
- `pay` or `salary` - Compensation information
- `location` - Job location
- `type` - Employment type (Full-time, Part-time, etc.)

### Example URLs

```
http://localhost:5173/?title=Customer%20Service%20Representative&company=Acme%20Corp&pay=$45,000-$55,000&location=Remote&type=Full-time

http://localhost:5173/?job=Data%20Entry%20Specialist&company=Tech%20Solutions&salary=$40k-$50k/year&location=Work%20from%20home&type=Contract
```

## Layout Structure

### Desktop (lg screens and above)
```
+----------------------------------+
| Header                           |
+----------+----------------------+
|          |                      |
| Sidebar  | Main Content Area    |
| (4 cols) | (8 cols)            |
|          |                      |
| Sticky   | Assessment Form      |
|          | Questions            |
|          |                      |
+----------+----------------------+
| Footer                           |
+----------------------------------+
```

### Mobile/Tablet (below lg)
```
+----------------------------------+
| Header                           |
+----------------------------------+
| Main Content Area (Full Width)  |
| Assessment Form                  |
| Questions                        |
+----------------------------------+
| Footer                           |
+----------------------------------+
```

## Behavior

1. **Contact Stage**: Sidebar is hidden even if job info exists
2. **Assessment Stage**: Sidebar appears if job info is available
3. **Success Stage**: Sidebar remains visible if job info exists
4. **No Job Info**: Layout reverts to centered single-column design

## Testing

To test the new layout:

1. Navigate to the assessment page with job parameters:
   ```
   http://localhost:5173/?title=Test%20Position&company=Test%20Company&pay=$50k&location=Remote&type=Full-time
   ```

2. Fill out the contact information form

3. The sidebar should appear on the left showing the job details

4. Complete the assessment to see the sidebar persist through all stages

## Future Enhancements

Potential improvements:
- Add job description field to sidebar
- Include application deadline
- Show job requirements/qualifications
- Add "Apply Now" or "Save Job" buttons
- Integration with job board APIs
