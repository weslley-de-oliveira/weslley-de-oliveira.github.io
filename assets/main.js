const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');

function syncToggleLabel() {
  toggle?.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Usar o tema escuro' : 'Usar o tema claro');
}

syncToggleLabel();
toggle?.addEventListener('click', () => {
  const light = root.dataset.theme !== 'light';
  if (light) root.dataset.theme = 'light';
  else delete root.dataset.theme;
  syncToggleLabel();
  try {
    localStorage.setItem('theme', light ? 'light' : 'dark');
  } catch {}
});

for (const el of document.querySelectorAll('[data-year]')) {
  el.textContent = String(new Date().getFullYear());
}

const revealTargets = document.querySelectorAll('.project, .principles li, .timeline-item, .skill-group');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const el of revealTargets) {
    el.classList.add('reveal');
    observer.observe(el);
  }
}
