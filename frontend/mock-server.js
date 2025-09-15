const express = require('express');
const app = express();
app.use(express.json());
// Allow CORS for local testing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/generate-tests', (req, res) => {
  res.json({ status: "success", message: "Mock tests generated" });
});

// Endpoint that returns a plain-text error (to reproduce the "Unexpected token 'A'" case)
app.post('/api/error-text', (req, res) => {
  res.status(500).type('text/plain').send('A problem occurred while trying to handle a proxied rewrite: Cloud Run rewrites must supply a service ID.');
});

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mock API server running on port ${PORT}`);
  });
}

module.exports = app;
