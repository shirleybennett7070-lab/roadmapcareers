# Stage Management System

## Overview
Centralized stage management makes it easy to update the funnel flow without changing code in multiple places.

## Lead Stages

1. **1_JOBS_LIST_SENT** - Initial response with jobs list
2. **2_ASSESSMENT_COMPLETED** - Lead completed candidate assessment (skill assessment offer sent automatically)
3. **3_SKILL_ASSESSMENT_COMPLETED** - Lead completed skill assessment (soft pitch sent automatically)
4. **4_SOFT_PITCH_SENT** - Assessment review/soft pitch sent
5. **5_TRAINING_OFFERED** - Full certification offer sent
6. **6_PAID** - Lead paid for certification
7. **7_FOLLOW_UP** - Follow-up email sent
8. **8_DROPPED** - Lead is no longer active

## How to Use

### 1. Get Initial Stage for New Leads
```javascript
import { getInitialStage } from './services/leadsService.js';

const stage = getInitialStage(); // Returns STAGE_1_JOBS_LIST_SENT
```

### 2. Move to Next Stage Automatically
```javascript
import { getNextStage } from './services/leadsService.js';

const nextStage = getNextStage(currentStage);
```

### 3. Move to Specific Stage
```javascript
import { moveToStage } from './services/leadsService.js';

// Manual stage transitions
stage = moveToStage.jobsListSent();
stage = moveToStage.assessmentCompleted();
stage = moveToStage.skillAssessmentCompleted();
stage = moveToStage.softPitchSent();
stage = moveToStage.trainingOffered();
stage = moveToStage.paid();
stage = moveToStage.followUp();
stage = moveToStage.dropped();
```

## Stage Progression Map

The progression is defined in `STAGE_PROGRESSION` in `leadsService.js`:

```javascript
const STAGE_PROGRESSION = {
  '1_JOBS_LIST_SENT': '1_JOBS_LIST_SENT', // Stays until they complete assessment
  '2_ASSESSMENT_COMPLETED': '2_ASSESSMENT_COMPLETED', // Stays until they complete skill assessment
  '3_SKILL_ASSESSMENT_COMPLETED': '4_SOFT_PITCH_SENT',
  '4_SOFT_PITCH_SENT': '5_TRAINING_OFFERED',
  '5_TRAINING_OFFERED': '5_TRAINING_OFFERED', // Stays on same stage
  '6_PAID': '6_PAID', // Final stage
  '7_FOLLOW_UP': '7_FOLLOW_UP',
  '8_DROPPED': '8_DROPPED'
};
```

## Benefits

1. **Single Source of Truth** - All stage definitions in one place
2. **Easy to Update** - Change stage names or add new stages without touching multiple files
3. **Automatic Progression** - `getNextStage()` handles the flow logic
4. **Type-Safe** - Helper functions prevent typos and invalid stages
5. **Self-Documenting** - Clear function names explain intent

## How to Add a New Stage

1. Add the stage to `LEAD_STAGES` constant
2. Add progression rule to `STAGE_PROGRESSION`
3. Add helper function to `moveToStage`
4. Add template case in `getTemplateForStage()` if needed

That's it! No need to update routes or processors.
