import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from '../db/index.js';
import { CONFIG } from '../shared/constants.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
  db = initDatabase();
  console.log('✓ Database initialized');
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}

// Health check endpoint
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

// Configuration endpoint
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    quotaLimits: {
      maxJobsPerSearch: 50,
      dailyTarget: 200,
      monthlyTarget: 800,
    },
  });
});

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
  console.log(`✓ Ready for development`);
});