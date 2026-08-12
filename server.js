const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Baseline security headers. CSP is intentionally not forced here because the
// current frontend uses inline scripts and trusted CDN resources; add a strict
// CSP after migrating those scripts to external files.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Never cache authentication pages or the dynamic data file.
app.use((req, res, next) => {
  if (/\/(login|signup|dashboard)\.html$/.test(req.path) || req.path === '/content-data.json') {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

// Serve static files from the current directory.
app.use(express.static(__dirname, { dotfiles: 'ignore', etag: true }));

// Handle SPA routing for unknown browser routes without exposing server details.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
