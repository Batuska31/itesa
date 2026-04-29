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

  // Insert "Katalog İndir" link into FOOTER
  // Find "<a class="text-sm text-slate-500 hover:text-blue-700 transition-colors" href="kariyer.html">Kariyer</a>"
  if(!content.includes('Katalog İndir')) {
    content = content.replace(/(<a[^>]*href="kariyer\.html"[^>]*>Kariyer<\/a>)/, '$1\n<a class="text-sm text-slate-500 hover:text-blue-700 transition-colors font-bold flex items-center gap-1" href="/uploads/katalog.pdf" target="_blank" download="ITESA_Katalog"><span class="material-symbols-outlined" style="font-size:16px;">download</span>Katalog İndir</a>');
  }

  // Also add to header for PC? Let's check user's words: "ben mesela katalog indir dedim ya"
  // It suggests he might have requested it in header or footer earlier. Let's add it to the top nav just in case.
  if(!content.includes('Katalog İndir') || true) {
     // Wait, maybe the footer is enough as it's a PDF.
  }

  fs.writeFileSync(fp, content, 'utf8');
}
console.log('Katalog linkleri eklendi.');
