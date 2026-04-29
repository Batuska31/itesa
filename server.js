const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
} catch (e) {
  console.warn('Could not create uploads directory (might be on a read-only environment)');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, 'katalog.pdf')
});
const upload = multer({ storage });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// ═══════════════════════════════════════════
//  AUTH — Simple token-based admin auth
// ═══════════════════════════════════════════
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'itesa2024';
const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function authMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
  next();
}

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = generateToken();
    sessions.set(token, { user: username, loginTime: Date.now() });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ═══════════════════════════════════════════
//  HELPERS — Read/Write JSON files
// ═══════════════════════════════════════════
function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════
//  PRODUCTS API
// ═══════════════════════════════════════════
// Public: Get all products
app.get('/api/products', (req, res) => {
  const data = readData('products.json');
  res.json(data ? data.products : []);
});

// Admin: Add product
app.post('/api/products', authMiddleware, (req, res) => {
  const data = readData('products.json') || { products: [] };
  const newProduct = {
    id: Date.now(),
    name: req.body.name || '',
    description: req.body.description || '',
    category: req.body.category || 'adaptorler',
    price: req.body.price || '',
    image: req.body.image || '',
    badge: req.body.badge || '',
    specs: req.body.specs || []
  };
  data.products.push(newProduct);
  writeData('products.json', data);
  res.json({ success: true, product: newProduct });
});

// Admin: Update product
app.put('/api/products/:id', authMiddleware, (req, res) => {
  const data = readData('products.json');
  const id = parseInt(req.params.id);
  const idx = data.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Ürün bulunamadı' });
  data.products[idx] = { ...data.products[idx], ...req.body, id };
  writeData('products.json', data);
  res.json({ success: true, product: data.products[idx] });
});

// Admin: Delete product
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const data = readData('products.json');
  const id = parseInt(req.params.id);
  data.products = data.products.filter(p => p.id !== id);
  writeData('products.json', data);
  res.json({ success: true });
});

// ═══════════════════════════════════════════
//  BLOG API
// ═══════════════════════════════════════════
app.get('/api/blog', (req, res) => {
  const data = readData('blog.json');
  res.json(data ? data.posts : []);
});

app.post('/api/blog', authMiddleware, (req, res) => {
  const data = readData('blog.json') || { posts: [] };
  const newPost = {
    id: Date.now(),
    title: req.body.title || '',
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    category: req.body.category || 'Genel',
    date: req.body.date || new Date().toISOString().split('T')[0],
    author: req.body.author || 'ITESA',
    icon: req.body.icon || 'article',
    color: req.body.color || 'blue'
  };
  data.posts.unshift(newPost);
  writeData('blog.json', data);
  res.json({ success: true, post: newPost });
});

app.put('/api/blog/:id', authMiddleware, (req, res) => {
  const data = readData('blog.json');
  const id = parseInt(req.params.id);
  const idx = data.posts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Yazı bulunamadı' });
  data.posts[idx] = { ...data.posts[idx], ...req.body, id };
  writeData('blog.json', data);
  res.json({ success: true, post: data.posts[idx] });
});

app.delete('/api/blog/:id', authMiddleware, (req, res) => {
  const data = readData('blog.json');
  const id = parseInt(req.params.id);
  data.posts = data.posts.filter(p => p.id !== id);
  writeData('blog.json', data);
  res.json({ success: true });
});

// ═══════════════════════════════════════════
//  CONTENT API — Dynamic page content
// ═══════════════════════════════════════════
app.get('/api/content', (req, res) => {
  const data = readData('content.json');
  res.json(data || {});
});

app.get('/api/content/:page', (req, res) => {
  const data = readData('content.json');
  res.json(data ? (data[req.params.page] || {}) : {});
});

app.put('/api/content/:page', authMiddleware, (req, res) => {
  const data = readData('content.json') || {};
  data[req.params.page] = req.body;
  writeData('content.json', data);
  res.json({ success: true });
});

// Add block to page section
app.post('/api/content/:page/blocks', authMiddleware, (req, res) => {
  const data = readData('content.json') || {};
  if (!data[req.params.page]) data[req.params.page] = {};
  if (!data[req.params.page].blocks) data[req.params.page].blocks = [];
  const newBlock = { id: Date.now(), ...req.body };
  data[req.params.page].blocks.push(newBlock);
  writeData('content.json', data);
  res.json({ success: true, block: newBlock });
});

// Delete block from page section
app.delete('/api/content/:page/blocks/:blockId', authMiddleware, (req, res) => {
  const data = readData('content.json') || {};
  if (data[req.params.page] && data[req.params.page].blocks) {
    const blockId = parseInt(req.params.blockId);
    data[req.params.page].blocks = data[req.params.page].blocks.filter(b => b.id !== blockId);
    writeData('content.json', data);
  }
  res.json({ success: true });
});

// ═══════════════════════════════════════════
//  CONTACT API
// ═══════════════════════════════════════════
app.get('/api/contact', (req, res) => {
  const data = readData('contact.json');
  res.json(data ? data.contact : {});
});

app.put('/api/contact', authMiddleware, (req, res) => {
  writeData('contact.json', { contact: req.body });
  res.json({ success: true });
});

// ═══════════════════════════════════════════
//  CATALOG UPLOAD API
// ═══════════════════════════════════════════
app.post('/api/upload-catalog', authMiddleware, upload.single('catalog'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi' });
  res.json({ success: true, url: '/uploads/katalog.pdf' });
});

// ═══════════════════════════════════════════
//  Start Server (Only if not on Vercel)
// ═══════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  🚀 ITESA Server running at:`);
    console.log(`     http://localhost:${PORT}`);
    console.log(`     Admin: http://localhost:${PORT}/admin.html\n`);
  });
}

module.exports = app;
