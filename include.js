/* Injects shared partials (nav/footer) into [data-include] targets,
   then fixes in-page anchors when on a sub-page, and signals readiness. */
async function includePartials() {
  const targets = [...document.querySelectorAll('[data-include]')];
  await Promise.all(targets.map(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url);
      const html = await res.text();
      el.outerHTML = html;
    } catch (e) {
      console.error('include failed:', url, e);
    }
  }));

  // On sub-pages, rewrite "#section" anchors to point back to the home page.
  const path = location.pathname.split('/').pop();
  const onHome = path === '' || path === 'index.html';
  if (!onHome) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href.length > 1) a.setAttribute('href', 'index.html' + href);
    });
  }
  // mobile hamburger toggle
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.textContent = '☰';
      })
    );
  }

  document.dispatchEvent(new CustomEvent('partials:loaded'));
}
document.addEventListener('DOMContentLoaded', includePartials);

/* Shared "concept site" placeholder toast for any a.soon link. */
(function setupToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  let timer;
  const ready = () => document.body.appendChild(toast);
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.soon');
    if (!a) return;
    e.preventDefault();
    toast.textContent = '準備中です（コンセプトサイトのため非公開）';
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2600);
  });
})();
