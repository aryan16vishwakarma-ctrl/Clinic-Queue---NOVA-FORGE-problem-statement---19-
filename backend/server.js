// Starts the HTTP server listener for CareQueue.

import app from './src/app.js';
import { PORT } from './src/config.js';

app.listen(PORT, () => {
  console.log(`CareQueue server listening at http://localhost:${PORT}`);
});
