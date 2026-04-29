/* ═══════════════════════════════════════════════════════
   ITESA — Scroll Animation Engine (Intersection Observer)
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Scroll-triggered animations ──
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // only once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  // ── 2. Stagger children ──
  document.querySelectorAll('[data-stagger]').forEach(container => {
    const children = container.querySelectorAll('[data-animate]');
    children.forEach((child, i) => {
      child.style.setProperty('--stagger-index', i);
    });
  });

  // ── 3. Counter animation ──
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => {
    counterObserver.observe(el);
  });

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ── 4. Parallax on scroll ──
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  // ── 5. Nav scroll effect ──
  const nav = document.getElementById('main-nav') || document.querySelector('nav');
  if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 80) {
        nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.08)';
      } else {
        nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ── 6. Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});

// ── CMS Content Loader ──
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) return;
    const data = await res.json();
    
    // Sektorler Page
    if (window.location.pathname.includes('sektorler.html')) {
      const titleEl = document.getElementById('sektor-hero-title');
      const subEl = document.getElementById('sektor-hero-subtitle');
      if(titleEl && data.sektorler && data.sektorler.hero) {
        titleEl.textContent = data.sektorler.hero.title;
        subEl.textContent = data.sektorler.hero.subtitle;
      }

      const container = document.getElementById('dynamic-sectors');
      if (container && data.sektorler && data.sektorler.blocks) {
        container.innerHTML = data.sektorler.blocks.map(b => `
          <div class="group bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-outline-variant/10">
            <div class="p-8 pb-4">
              <div class="w-16 h-16 rounded-xl bg-$((b.color||'blue'))-50 flex items-center justify-center text-$((b.color||'blue'))-600 mb-6 transition-transform group-hover:scale-110">
                <span class="material-symbols-outlined text-3xl">$((b.icon||'category'))</span>
              </div>
              <h3 class="text-2xl font-headline font-bold text-slate-900 mb-4">$((b.title||''))</h3>
              <p class="text-on-surface-variant leading-relaxed min-h-[80px]">$((b.description||''))</p>
            </div>
            <div class="px-8 pb-8 pt-2">
               <div class="h-1 w-12 bg-primary group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
          </div>
        `).join('');
      }
    }
  
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
    }
  } catch (e) {
    console.error('CMS Error:', e);
  }
});

// --- Homepage Products ---
let allHpProducts = [];

async function loadHpProducts() {
  if (!document.getElementById('hp-dynamic-products')) return;
  try {
    const pRes = await fetch('/api/products');
    allHpProducts = await pRes.json();
    renderHpProducts('all');
    
    // Bind filters
    document.querySelectorAll('.hp-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.hp-filter-btn').forEach(b => {
          b.classList.remove('bg-primary', 'text-white');
          b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
        });
        e.target.classList.add('bg-primary', 'text-white');
        e.target.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
        renderHpProducts(e.target.dataset.filter);
      });
    });
  } catch(e) {}
}

function renderHpProducts(filter) {
  const container = document.getElementById('hp-dynamic-products');
  if(!container) return;
  const filtered = filter === 'all' ? allHpProducts : allHpProducts.filter(p => p.category === filter);
  
  // Show max 3 on homepage
  const toShow = filtered.slice(0,3);
  
  if (toShow.length === 0) {
    container.innerHTML = '<div class="col-span-3 text-center py-10 text-on-surface-variant">Bu kategoride henüz ürün bulunmuyor.</div>';
    return;
  }
  
  container.innerHTML = toShow.map(p => `
      <div class="group relative bg-surface-container-lowest rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col h-full card-hover animate-fade-in-up">
        <div class="aspect-square rounded-2xl overflow-hidden mb-8 bg-surface-container-low flex items-center justify-center p-8 relative">
          $
          <img alt="$" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" src="$"/>
        </div>
        <div class="mt-auto">
          <h3 class="text-xl font-bold mb-2">$</h3>
          <p class="text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-2">$</p>
          <a href="urunler.html" class="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">İncele <span class="material-symbols-outlined text-lg">arrow_forward</span></a>
        </div>
      </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadHpProducts);
