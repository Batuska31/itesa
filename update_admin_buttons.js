const fs = require('fs');
const path = require('path');

const fp = path.join(__dirname, 'admin.html');
let html = fs.readFileSync(fp, 'utf8');

// 1. HTML Update
const oldHtmlBlock = `<div class="admin-card">
<h3 class="font-bold mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-green-600">home</span>Ana Sayfa</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div><label class="form-label">Hero Başlık</label><input type="text" id="hp-title" class="form-input"/></div>
<div><label class="form-label">Hero Alt Başlık</label><input type="text" id="hp-subtitle" class="form-input"/></div>
</div>
<button onclick="saveHomepageContent()" class="btn btn-primary mt-4"><span class="material-symbols-outlined">save</span>Kaydet</button>
</div>`;

const newHtmlBlock = `<div class="admin-card">
<h3 class="font-bold mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-green-600">home</span>Ana Sayfa</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div><label class="form-label">Hero Başlık</label><input type="text" id="hp-title" class="form-input"/></div>
<div><label class="form-label">Hero Alt Başlık</label><input type="text" id="hp-subtitle" class="form-input"/></div>
</div>
<div class="mt-6 border-t border-slate-200 pt-4">
  <div class="flex justify-between items-center mb-4">
    <label class="form-label mb-0">Hero Butonları (Ürünleri Keşfet, vs.)</label>
    <button onclick="addHpButton()" class="btn btn-ghost py-1 px-3 text-xs flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:16px;">add</span>Yeni Buton</button>
  </div>
  <div id="hp-buttons-list" class="space-y-3"></div>
</div>
<button onclick="saveHomepageContent()" class="btn btn-primary mt-6"><span class="material-symbols-outlined">save</span>Kaydet</button>
</div>`;

html = html.replace(oldHtmlBlock, newHtmlBlock);

// 2. JS Updates (State & Helpers)
const jsFunctions = `
let currentHpButtons = [];
function renderHpButtons() {
   const container = document.getElementById('hp-buttons-list');
   container.innerHTML = currentHpButtons.map((b, i) => \`
     <div class="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border">
       <input type="text" class="form-input py-1 text-sm flex-1" placeholder="Metin" value="\${b.text}" onchange="currentHpButtons[\${i}].text=this.value">
       <input type="text" class="form-input py-1 text-sm flex-1" placeholder="Link (Dosya veya URL)" value="\${b.link}" onchange="currentHpButtons[\${i}].link=this.value">
       <select class="form-input py-1 text-sm flex-1" onchange="currentHpButtons[\${i}].style=this.value">
         <option value="primary" \${b.style==='primary'?'selected':''}>Vurgulu (Ana)</option>
         <option value="secondary" \${b.style==='secondary'?'selected':''}>Saydam (İkincil)</option>
       </select>
       <button onclick="currentHpButtons.splice(\${i},1); renderHpButtons()" class="text-red-500 hover:text-red-700 px-2"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
     </div>
   \`).join('');
}
function addHpButton() {
   currentHpButtons.push({ text: 'Yeni Buton', link: '#', style: 'primary' });
   renderHpButtons();
}
`;

if (!html.includes('function addHpButton()')) {
  html = html.replace('let contentData = {};', 'let contentData = {};\n' + jsFunctions);
}

// 3. Render Hook Update
const oldRender = `  // Homepage
  if(contentData.homepage && contentData.homepage.hero) {
    document.getElementById('hp-title').value = contentData.homepage.hero.title || '';
    document.getElementById('hp-subtitle').value = contentData.homepage.hero.subtitle || '';
  }`;

const newRender = `  // Homepage
  if(contentData.homepage && contentData.homepage.hero) {
    document.getElementById('hp-title').value = contentData.homepage.hero.title || '';
    document.getElementById('hp-subtitle').value = contentData.homepage.hero.subtitle || '';
    currentHpButtons = contentData.homepage.hero.buttons || [];
    renderHpButtons();
  }`;

html = html.replace(oldRender, newRender);

// 4. Save Hook Update
const oldSave = `async function saveHomepageContent() {
  const data = {
    hero: {
      title: document.getElementById('hp-title').value,
      subtitle: document.getElementById('hp-subtitle').value
    }
  };`;

const newSave = `async function saveHomepageContent() {
  const data = {
    hero: {
      title: document.getElementById('hp-title').value,
      subtitle: document.getElementById('hp-subtitle').value,
      buttons: currentHpButtons
    }
  };`;

html = html.replace(oldSave, newSave);

fs.writeFileSync(fp, html, 'utf8');
console.log('Admin UI Updated');
