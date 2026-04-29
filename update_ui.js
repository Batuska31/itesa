const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'cozumler.html', 'sektorler.html', 
  'hakkimizda.html', 'iletisim.html', 'blog.html', 
  'urunler.html', 'gizlilik.html', 'kullanim-sartlari.html', 'cerez-politikasi.html', 'kariyer.html'
];

for (const file of files) {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // 1. ADD "Ürünler" TO DESKTOP NAVBAR (if not present) 
  // Look for "Çözümler" link to inject after it
  if (!content.includes('href="urunler.html"')) {
    // Desktop Nav Insert
    content = content.replace(/(<a[^>]*href="cozumler\.html"[^>]*>Çözümler<\/a>)/, '$1\n<a class="text-slate-600 hover:text-blue-600 transition-all duration-300 underline-grow" href="urunler.html">Ürünler</a>');
    // Mobile Nav Insert
    content = content.replace(/(<a class="block[^>]*href="cozumler\.html"[^>]*>Çözümler<\/a>)/, '$1\n<a class="block text-slate-600 hover:text-blue-600" href="urunler.html">Ürünler</a>');
  }

  // 2. ADD "Ürünler" and "Admin" TO FOOTER
  // Find Footer Links div
  if(!content.includes('>Yönetici Girişi<')) {
    content = content.replace(/(<a[^>]*href="kariyer\.html"[^>]*>Kariyer<\/a>)/, '$1\n<a class="text-sm text-slate-500 hover:text-blue-700 transition-colors" href="urunler.html">Ürünler</a>\n<a class="text-sm border-l border-slate-300 pl-4 ml-4 text-slate-400 hover:text-blue-700 transition-colors" href="admin.html">Yönetici Girişi</a>');
  }

  // 3. FIX COZUMLER.HTML ICONS
  if(file === 'cozumler.html') {
    content = content.replace(
      'family=Material+Symbols+Outlined:wght,FILL@100..700,0..1',
      'family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,0,24'
    );
  }

  fs.writeFileSync(fp, content, 'utf8');
  console.log('Updated ' + file);
}
