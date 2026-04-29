const fs = require('fs');
const path = require('path');

const contentJsonPath = path.join(__dirname, 'data', 'content.json');
let content = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'));
if (!content.homepage) content.homepage = {};
if (!content.homepage.hero) content.homepage.hero = {};
if (!content.homepage.hero.buttons) {
  content.homepage.hero.buttons = [
    { text: 'Ürünleri Keşfet', link: 'urunler.html', style: 'primary' },
    { text: 'Katalog İndir', link: '/uploads/katalog.pdf', style: 'secondary' }
  ];
}
fs.writeFileSync(contentJsonPath, JSON.stringify(content, null, 2));

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(
  /<div class="flex flex-col md:flex-row items-center justify-center gap-6" data-animate="fade-up" data-delay="3">[\s\S]*?<\/div>/,
  `<div class="flex flex-col md:flex-row items-center justify-center gap-6" data-animate="fade-up" data-delay="3" id="hp-hero-buttons">
      <a href="urunler.html" class="btn-primary-gradient text-on-primary px-10 py-5 rounded-xl font-semibold text-lg shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all">Ürünleri Keşfet</a>
      <a href="/uploads/katalog.pdf" target="_blank" class="bg-surface-container-high text-on-surface px-10 py-5 rounded-xl font-semibold text-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-all">Katalog İndir</a>
  </div>`
);
fs.writeFileSync(indexHtmlPath, indexHtml);

const animJsPath = path.join(__dirname, 'animations.js');
let animJs = fs.readFileSync(animJsPath, 'utf8');
const btnLogic = `
    // Homepage Buttons
    if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('anasayfa.html')) {
        const btnContainer = document.getElementById('hp-hero-buttons');
        if(btnContainer && data.homepage && data.homepage.hero && data.homepage.hero.buttons) {
           btnContainer.innerHTML = data.homepage.hero.buttons.map(b => {
              const primaryClass = "btn-primary-gradient text-on-primary px-10 py-5 rounded-xl font-semibold text-lg shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all";
              const secondaryClass = "bg-surface-container-high text-on-surface px-10 py-5 rounded-xl font-semibold text-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-all";
              const isExt = b.link.includes('pdf') || b.link.includes('http') ? ' target="_blank"' : '';
              return '<a href="' + b.link + '"' + isExt + ' class="' + (b.style==='primary'?primaryClass:secondaryClass) + '">' + b.text + '</a>';
           }).join('');
        }
    }`;
if (!animJs.includes('hp-hero-buttons')) {
  animJs = animJs.replace(/} catch \(e\) {/, btnLogic + '\n  } catch (e) {');
  fs.writeFileSync(animJsPath, animJs);
}
console.log('Update Complete');
