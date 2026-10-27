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

  // 3. ANIMAÇÕES AO ROLAR A PÁGINA
  const fadeElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeElements.forEach(el => fadeObserver.observe(el));

  // 4. ENVIO DO FORMULÁRIO DE CONTATO VIA SUPABASE
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); 
      
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      const nome = document.getElementById('contatoNome').value;
      const email = document.getElementById('contatoEmail').value;
      const negocio = document.getElementById('contatoNegocio').value;
      const mensagem = document.getElementById('contatoMensagem').value;

      // Envia com o status padrão 'pendente'
      const { data, error } = await supabaseClient
        .from('contatos')
        .insert([{ nome, email, negocio, mensagem, status: 'pendente' }]);

      if (error) {
        console.error(error);
        alert('Ocorreu um erro ao enviar. Verifique sua conexão.');
      } else {
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        form.reset(); 
      }
      
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
});