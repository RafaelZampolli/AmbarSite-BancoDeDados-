/* ==========================================================
   AMBAR WEB — SCRIPT PRINCIPAL
   ========================================================== */

(function () {
  'use strict';

  // Ano dinâmico no footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Menu mobile
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? '✕' : '☰';
    });

    // Fecha menu ao clicar em um link (mobile)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      });
    });
  }

  // Feedback no envio do formulário
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
      }
    });
  }

  // Fecha o menu mobile ao clicar fora
  document.addEventListener('click', (e) => {
    if (!nav || !navToggle) return;
    const isClickInsideNav = nav.contains(e.target);
    const isClickOnToggle = navToggle.contains(e.target);
    if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    }
  });
})();