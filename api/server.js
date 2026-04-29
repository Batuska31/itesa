const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, '..', 'data');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// (Statik dosyalar Vercel tarafından otomatik olarak servis edilecektir)

// ═══════════════════════════════════════════
//  HELPERS — Read JSON files
// ═══════════════════════════════════════════
function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════
//  PUBLIC API ROUTES
// ═══════════════════════════════════════════

// Products
app.get('/api/products', (req, res) => {
  const data = readData('products.json');
  res.json(data ? data.products : []);
});

// Blog
app.get('/api/blog', (req, res) => {
  const data = readData('blog.json');
  res.json(data ? data.posts : []);
});

// Content
app.get('/api/content', (req, res) => {
  const data = readData('content.json');
  res.json(data || {});
});

app.get('/api/content/:page', (req, res) => {
  const data = readData('content.json');
  res.json(data ? (data[req.params.page] || {}) : {});
});

// Contact
app.get('/api/contact', (req, res) => {
  const data = readData('contact.json');
  res.json(data ? data.contact : {});
});

// ═══════════════════════════════════════════
//  Start Server (Only if not on Vercel)
// ═══════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  🚀 ITESA Server running at: http://localhost:${PORT}\n`);
  });
}

module.exports = app;
