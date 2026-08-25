import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { initDatabase, getDatabase } from '../db/index.js';
import { CONFIG } from '../shared/constants.js';
import { parseResume } from './resumeParser.js';
import { saveProfile, getProfile, listProfiles, deleteProfile } from './profileService.js';
import { PDFParse } from 'pdf-parse';
import type {
  ParseResumeResponse,
  SaveProfileRequest,
  SaveProfileResponse,
  GetProfileResponse,
  UserProfile,
} from '../shared/types.js';

// pdf-parse will be imported dynamically in the upload handler

// Load environment variables
dotenv.config();

// Main async function to initialize the server
async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Configure multer for file uploads (memory storage - files not saved to disk)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    },
  });

  // Environment validation
  const JOBSPIPE_API_KEY = process.env.JOBSPIPE_API_KEY;

  if (!JOBSPIPE_API_KEY) {
    console.error('❌ JOBSPIPE_API_KEY not found in environment variables');
    console.error('Please create a .env file with your JobsPipe API key');
    console.error('See .env.example for template');
    process.exit(1);
  }

  // Initialize database
  let db;
  try {
    db = await initDatabase();
    console.log('✓ Database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

// ============================================================================
// Health & Config Endpoints
// ============================================================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      jobsPipeConfigured: !!JOBSPIPE_API_KEY,
      databaseConnected: !!db,
    },
  });
});

app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    quotaLimits: {
      maxJobsPerSearch: 50,
      dailyTarget: 200,
      monthlyTarget: 800,
    },
  });
});

// ============================================================================
// Profile Endpoints (Milestone 1)
// ============================================================================

/**
 * Upload and parse resume PDF
 * POST /api/profile/upload
 */
app.post('/api/profile/upload', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      } as ParseResumeResponse);
    }

    // Import pdf-parse using dynamic import (ES module compatible)
const pdfParseModule = await import('pdf-parse');
const pdfParse = pdfParseModule.default;

// Extract text from PDF
const pdfData = await pdfParse(req.file.buffer);
const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from PDF',
      } as ParseResumeResponse);
    }

    // Parse resume
    const profile = parseResume(text, req.file.originalname);

    // Save to database
    const dbInstance = getDatabase();
    saveProfile(dbInstance, profile);

    res.json({
      success: true,
      profile,
    } as ParseResumeResponse);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process resume',
    } as ParseResumeResponse);
  }
});

/**
 * Get current profile
 * GET /api/profile
 */
app.get('/api/profile', (req: Request, res: Response) => {
  try {
    const dbInstance = getDatabase();
    const profile = getProfile(dbInstance);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'No profile found',
      } as GetProfileResponse);
    }

    res.json({
      success: true,
      profile,
    } as GetProfileResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile',
    } as GetProfileResponse);
  }
});

/**
 * Get profile by ID
 * GET /api/profile/:id
 */
app.get('/api/profile/:id', (req: Request, res: Response) => {
  try {
    const dbInstance = getDatabase();
    const profileId = typeof req.params.id === 'string' ? req.params.id : Array.isArray(req.params.id) ? req.params.id[0] : '';
    const profile = getProfile(dbInstance, profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      } as GetProfileResponse);
    }

    res.json({
      success: true,
      profile,
    } as GetProfileResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile',
    } as GetProfileResponse);
  }
});

/**
 * Save/update profile
 * POST /api/profile
 */
app.post('/api/profile', (req: Request, res: Response) => {
  try {
    const { profile } = req.body as SaveProfileRequest;

    if (!profile || !profile.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile data',
      } as SaveProfileResponse);
    }

    // Update timestamp
    profile.updatedAt = new Date();

    const dbInstance = getDatabase();
    saveProfile(dbInstance, profile);

    res.json({
      success: true,
      profileId: profile.id,
    } as SaveProfileResponse);
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save profile',
    } as SaveProfileResponse);
  }
});

/**
 * List all profiles (metadata only)
 * GET /api/profiles
 */
app.get('/api/profiles', (req: Request, res: Response) => {
  try {
    const dbInstance = getDatabase();
    const profiles = listProfiles(dbInstance);

    res.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error('List profiles error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list profiles',
    });
  }
});

/**
 * Delete profile
 * DELETE /api/profile/:id
 */
app.delete('/api/profile/:id', (req: Request, res: Response) => {
  try {
    const dbInstance = getDatabase();
    deleteProfile(dbInstance, req.params.id);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete profile',
    });
  }
});

// ============================================================================
// Error Handling
// ============================================================================

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

  // ============================================================================
  // Error Handling
  // ============================================================================

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Start server
  const PORT = CONFIG.SERVER_PORT;
  app.listen(PORT, () => {
    console.log(`🚀 JobLister backend running on http://localhost:${PORT}`);
    console.log(`✓ JobsPipe API key configured`);
    console.log(`✓ Profile management endpoints ready`);
    console.log(`✓ Ready for development`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
