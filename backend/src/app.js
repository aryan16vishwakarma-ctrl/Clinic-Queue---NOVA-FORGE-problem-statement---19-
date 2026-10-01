// Builds and configures the Express application, mounts middleware and API routes.

import express from 'express';
import path from 'node:path';
import { dailyReset } from './middleware/dailyReset.js';
import { errorHandler } from './middleware/errorHandler.js';
import patientRoutes from './routes/patientRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

app.use(express.json());

// Daily reset middleware runs on all incoming requests to guarantee date accuracy.
app.use(dailyReset);

// Serve frontend directory directly
const frontendPath = path.resolve(process.cwd(), 'frontend');
app.use(express.static(frontendPath));

// Mount JSON API routes
app.use('/api', patientRoutes);
app.use('/api', queueRoutes);
app.use('/api', demoRoutes);
app.use('/api', appointmentRoutes);

// Catch unknown API requests and return standard JSON error
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Centralized error handling
app.use(errorHandler);

export default app;
