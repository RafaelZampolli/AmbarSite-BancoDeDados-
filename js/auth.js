document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  // ========== LÓGICA DA PÁGINA DE LOGIN ==========
  if (loginForm) {
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleAuth = document.getElementById('toggleAuth');
    
    let isLogin = true;

    // Alternar entre Login e Cadastro
    toggleAuth.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      
      if (isLogin) {
        formTitle.textContent = 'Entrar na conta';
        formSubtitle.textContent = 'Insira seus dados de acesso.';
        submitBtn.textContent = 'Entrar';
        toggleText.textContent = 'Não tem conta?';
        toggleAuth.textContent = 'Criar agora';
      } else {
        formTitle.textContent = 'Criar nova conta';
        formSubtitle.textContent = 'Preencha os dados para se cadastrar.';
        submitBtn.textContent = 'Cadastrar';
        toggleText.textContent = 'Já tem uma conta?';
        toggleAuth.textContent = 'Fazer login';
      }
    });

    // Processar envio do formulário (Login ou Cadastro)
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;

      // Pega os usuários salvos no navegador
      const users = JSON.parse(localStorage.getItem('ambar_users') || '{}');

      if (isLogin) {
        if (users[email] && users[email] === pass) {
          localStorage.setItem('ambar_logged', email);
          window.location.href = 'index.html';
        } else {
          alert('E-mail ou senha incorretos. Tente novamente.');
        }
      } else {
        if (users[email]) {
          alert('Este e-mail já está cadastrado. Faça login.');
        } else {
          users[email] = pass;
          localStorage.setItem('ambar_users', JSON.stringify(users));
          localStorage.setItem('ambar_logged', email);
          alert('Conta criada com sucesso! Bem-vindo à Ambar Web.');
          window.location.href = 'index.html';
        }
      }
    });
  }

  // ========== PROTEÇÃO DA PÁGINA PRINCIPAL ==========
  // Se o usuário estiver tentando acessar o index.html sem estar logado, redireciona para o login.
  const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  
  if (isIndexPage) {
    const loggedUser = localStorage.getItem('ambar_logged');
    
    if (!loggedUser) {
      window.location.href = 'login.html';
    } else {
      // Mostra o e-mail do usuário logado no menu superior
      const userDisplay = document.getElementById('userEmail');
      if (userDisplay) userDisplay.textContent = loggedUser;
    }
  }
});

// Função de Logout global
function logout() {
  localStorage.removeItem('ambar_logged');
  window.location.href = 'login.html';
}