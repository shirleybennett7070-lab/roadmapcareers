import express from 'express';
import { fetchAllJobs } from './services/jobApis.js';
import { addJobs, getAllJobs } from './services/sheetsService.js';

const router = express.Router();

/**
 * GET /api/jobs
 * Get all jobs from Google Sheets
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/jobs/fetch
 * Fetch new jobs from APIs and add to sheet
 */
router.post('/fetch', async (req, res) => {
  try {
    const limit = req.body.limit || 20;
    
    // Fetch jobs
    const jobs = await fetchAllJobs(limit);
    
    if (jobs.length === 0) {
      return res.json({
        success: true,
        message: 'No new jobs found',
        added: 0
      });
    }
    
    // Add to sheet
    const addedCount = await addJobs(jobs);
    
    res.json({
      success: true,
      message: `Successfully added ${addedCount} new jobs`,
      added: addedCount,
      duplicates: jobs.length - addedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/jobs
 * Manually add a single job to the sheet
 */
router.post('/', async (req, res) => {
  try {
    const job = req.body;
    
    // Validate required fields
    if (!job.title || !job.company || !job.originalUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, company, originalUrl'
      });
    }
    
    // Add default values
    const jobWithDefaults = {
      jobId: `manual_${Date.now()}`,
      title: job.title,
      company: job.company,
      description: job.description || 'No description',
      requirements: job.requirements || 'Not specified',
      salaryRange: job.salaryRange || 'Not specified',
      location: job.location || 'Remote',
      originalUrl: job.originalUrl,
      datePosted: job.datePosted || new Date().toISOString(),
      source: job.source || 'Manual',
      category: job.category || 'General'
    };
    
    const addedCount = await addJobs([jobWithDefaults]);
    
    res.json({
      success: true,
      message: 'Job added successfully',
      added: addedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
