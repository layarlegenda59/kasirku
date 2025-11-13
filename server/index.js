// Use the extracted app so it can be reused by the serverless wrapper
const { app, db, useNeon } = require('./app');

// If this file is run directly start the server (local dev)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}