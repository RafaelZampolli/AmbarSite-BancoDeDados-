document.addEventListener('DOMContentLoaded', () => {
  // 1. Ano dinâmico no footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Menu mobile
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? '✕' : '☰';
    });
  }

  // 3. ANIMAÇÕES AO ROLAR A PÁGINA (Fade In)
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target); // Para de observar após animar
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // 4. CONSERTO DO FORMULÁRIO DE CONTATO (Feedback visual)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Impede o recarregamento da página
      
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      // Feedback visual de envio
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // Simula o tempo de envio para mostrar o sucesso
      setTimeout(() => {
        alert('Mensagem enviada com sucesso! O time da Ambar Web entrará em contato em breve.');
        form.reset(); // Limpa os campos
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 1500);
    });
  }
});