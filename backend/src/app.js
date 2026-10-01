// Builds and configures the Express application, mounts middleware and API routes.

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { dailyReset } from './middleware/dailyReset.js';
import { errorHandler } from './middleware/errorHandler.js';
import patientRoutes from './routes/patientRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

const app = express();

app.use(express.json());

// Daily reset middleware runs on all incoming requests to guarantee date accuracy.
app.use(dailyReset);

// Serve built React app if dist exists, otherwise fall back to frontend
const distPath = path.resolve(process.cwd(), 'dist');
const frontendPath = path.resolve(process.cwd(), 'frontend');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(frontendPath));
}

// Mount JSON API routes
app.use('/api', patientRoutes);
app.use('/api', queueRoutes);
app.use('/api', demoRoutes);

// Catch unknown API requests and return standard JSON error
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized error handling
app.use(errorHandler);

export default app;
