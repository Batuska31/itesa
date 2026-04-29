const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'cozumler.html', 'sektorler.html', 
  'hakkimizda.html', 'iletisim.html', 'blog.html', 
  'gizlilik.html', 'kullanim-sartlari.html', 'cerez-politikasi.html', 'kariyer.html'
];

for (const file of files) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Remove desktop "Başlayın" button
  content = content.replace(/<a href="iletisim\.html" class="hidden sm:inline-flex[^>]*>Ba(?:ş|ş|)lay(?:ı|ı|)n<\/a>/g, '');
  
  // Remove mobile "Başlayın" button
  content = content.replace(/<a href="iletisim\.html" class="block bg-primary text-white text-center[^>]*>Ba(?:ş|ş|)lay(?:ı|ı|)n<\/a>/g, '');
  
  // Add underline-grow hover effect to all nav links inside the <nav> element
  // First, let's just replace the exact class string
  content = content.replace(/hover:text-blue-600 transition-all duration-300"/g, 'hover:text-blue-600 transition-all duration-300 underline-grow"');

  fs.writeFileSync(fp, content, 'utf8');
  console.log('Updated nav in ' + file);
}
