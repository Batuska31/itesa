const fs = require('fs');
const path = require('path');

const ids = [
  { 
    file: 'cozumler.html', 
    titleSearch: /<h1 class="[^"]*font-headline[^"]*text-6xl[^"]*>\s*Çözümlerimiz\s*<\/h1>/,
    subSearch: /<p class="[^"]*text-xl[^"]*max-w-lg[^"]*>\s*Modern endüstriyel[^<]*<\/p>/
  },
  {
    file: 'hakkimizda.html',
    titleSearch: /<h1 class="[^"]*text-5xl[^"]*font-extrabold[^"]*>\s*Biz Kimiz\?\s*<\/h1>/,
    subSearch: /<p class="[^"]*text-xl[^"]*text-primary[^"]*>\s*Güvenilir Teknoloji[^<]*<\/p>/
  },
  {
    file: 'iletisim.html',
    titleSearch: /<h1 class="[^"]*text-5xl[^"]*font-bold[^"]*>\s*İletişime Geçin\s*<\/h1>/,
    subSearch: /<p class="[^"]*text-lg[^"]*text-on-surface-variant[^"]*>\s*Teknoloji tedarik süreçlerinizi[^<]*<\/p>/
  }
];

for (const item of ids) {
  const fp = path.join(__dirname, item.file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, 'utf8');

  // Inject ID into H1
  content = content.replace(item.titleSearch, match => {
    return match.replace('<h1 ', '<h1 id="gp-hero-title" ');
  });

  // Inject ID into Sub
  content = content.replace(item.subSearch, match => {
    return match.replace('<p ', '<p id="gp-hero-subtitle" ');
  });

  fs.writeFileSync(fp, content, 'utf8');
  console.log('Injected IDs into ' + item.file);
}

// Append Generic Pages logic to animations.js
const animPath = path.join(__dirname, 'animations.js');
let animContent = fs.readFileSync(animPath, 'utf8');
if (!animContent.includes('id="gp-hero-title"')) {
  animContent = animContent.replace(/} catch \(e\) {/, `
    // Generic Pages Content
    const gpTitleEl = document.getElementById('gp-hero-title');
    const gpSubEl = document.getElementById('gp-hero-subtitle');
    let pageKey = null;
    if (window.location.pathname.includes('cozumler.html')) pageKey = 'cozumler';
    else if (window.location.pathname.includes('hakkimizda.html')) pageKey = 'hakkimizda';
    else if (window.location.pathname.includes('iletisim.html')) pageKey = 'iletisim';
    
    if (pageKey && gpTitleEl && data[pageKey] && data[pageKey].hero) {
      if (data[pageKey].hero.title) gpTitleEl.textContent = data[pageKey].hero.title;
      if (data[pageKey].hero.subtitle && gpSubEl) gpSubEl.textContent = data[pageKey].hero.subtitle;
    }
  } catch (e) {`);
  fs.writeFileSync(animPath, animContent, 'utf8');
  console.log('Appended CMS logic to animations.js');
}

