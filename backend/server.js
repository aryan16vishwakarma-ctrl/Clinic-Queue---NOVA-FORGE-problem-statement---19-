// Starts the HTTP server listener for CareQueue and ensures MySQL schema is ready.

import app from './src/app.js';
import { PORT, DB_NAME, DB_HOST } from './src/config.js';
import { initSchema } from './src/db/schema.js';

async function startServer() {
  try {
    // Ensure MySQL appointment database tables exist
    await initSchema();
    console.log(`Connected to MySQL database "${DB_NAME}" at ${DB_HOST}`);

    app.listen(PORT, () => {
      console.log(`CareQueue server listening at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
