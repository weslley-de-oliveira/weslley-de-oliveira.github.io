const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tema: escuro por padrão, claro só por escolha.
const themeToggle = document.querySelector('.theme-toggle');

function syncThemeLabel() {
  themeToggle?.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Usar o tema escuro' : 'Usar o tema claro');
}

syncThemeLabel();
themeToggle?.addEventListener('click', () => {
  const light = root.dataset.theme !== 'light';
  if (light) root.dataset.theme = 'light';
  else delete root.dataset.theme;
  syncThemeLabel();
  drawStars();
  try {
    localStorage.setItem('tema', light ? 'light' : 'dark');
  } catch {}
});

// Menu em tela cheia.
const menuButton = document.querySelector('.menu-button');
const menu = document.getElementById('menu');

function setMenu(open) {
  if (!menuButton || !menu) return;
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar o menu' : 'Abrir o menu');
  document.body.classList.toggle('menu-open', open);
  if (open) menu.querySelector('a')?.focus();
}

menuButton?.addEventListener('click', () => setMenu(menu.hidden));
menu?.addEventListener('click', (event) => {
  if (event.target.closest('a') || event.target === menu) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu && !menu.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});

// Barra de progresso da rolagem.
const progress = document.querySelector('.scroll-progress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress?.style.setProperty('--progress', String(max > 0 ? window.scrollY / max : 0));
}
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

// Campo de estrelas no fundo.
const canvas = document.querySelector('.stars');
const context = canvas?.getContext('2d');
let stars = [];

function seedStars() {
  if (!canvas) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.round((window.innerWidth * window.innerHeight) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.2 + 0.3,
    a: Math.random() * 0.5 + 0.15,
    speed: Math.random() * 0.15 + 0.03,
  }));
}

function drawStars() {
  if (!context) return;
  const rgb = getComputedStyle(root).getPropertyValue('--star').trim();
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const star of stars) {
    context.beginPath();
    context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    context.fillStyle = `rgb(${rgb} / ${star.a})`;
    context.fill();
  }
}

function animateStars() {
  for (const star of stars) {
    star.y -= star.speed;
    if (star.y < -2) {
      star.y = window.innerHeight + 2;
      star.x = Math.random() * window.innerWidth;
    }
  }
  drawStars();
  requestAnimationFrame(animateStars);
}

if (canvas) {
  seedStars();
  drawStars();
  window.addEventListener('resize', () => {
    seedStars();
    drawStars();
  });
  if (!reducedMotion) requestAnimationFrame(animateStars);
}

// Prévia da captura ao passar o mouse sobre um projeto.
const preview = document.querySelector('.project-preview');
if (preview && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  for (const row of document.querySelectorAll('.project-row[data-preview]')) {
    row.addEventListener('mouseenter', () => {
      preview.src = row.dataset.preview;
      preview.classList.add('is-visible');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
    row.addEventListener('mousemove', (event) => {
      const container = row.closest('.container').getBoundingClientRect();
      const x = container.right - preview.offsetWidth - 40;
      preview.style.transform = `translate(${x}px, ${event.clientY - preview.offsetHeight / 2}px)`;
    });
  }
}

// Ano no rodapé.
for (const el of document.querySelectorAll('[data-year]')) {
  el.textContent = String(new Date().getFullYear());
}

// Entrada suave das seções.
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of revealTargets) observer.observe(el);
} else {
  for (const el of revealTargets) el.classList.add('is-visible');
}
