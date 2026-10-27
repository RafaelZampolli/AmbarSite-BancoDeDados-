const SUPABASE_URL = 'https://payyhgojskahdgwnzdnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXloZ29qc2thaGRnd256ZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc1MDMsImV4cCI6MjEwODcwMzUwM30.Dd4v4_aCFKOZaRTDxpWY1Le-tIINGbk_5ZnqmwyXeX8';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');

  // ========== LÓGICA DA PÁGINA DE LOGIN ==========
  if (loginForm) {
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleAuth = document.getElementById('toggleAuth');
    
    let isLogin = true;

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

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;

      submitBtn.textContent = 'Aguarde...';
      submitBtn.disabled = true;

      if (isLogin) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if (error) {
          alert('Erro ao entrar: ' + error.message);
          submitBtn.textContent = 'Entrar';
          submitBtn.disabled = false;
        } else {
          // Verifica se é funcionário ou admin para redirecionar
          const { data: perfil } = await supabaseClient.from('perfis').select('role').eq('email', email).single();
          
          if (perfil && (perfil.role === 'funcionario' || perfil.role === 'admin')) {
            window.location.href = 'dashboard.html'; // Vai para o painel interno
          } else {
            window.location.href = 'index.html';     // Vai para a área do cliente
          }
        }
      } else {
        const { data, error } = await supabaseClient.auth.signUp({ email, password: pass });
        if (error) {
          alert('Erro ao cadastrar: ' + error.message);
          submitBtn.textContent = 'Cadastrar';
          submitBtn.disabled = false;
        } else {
          alert('Conta criada! Se o login não for automático, verifique seu e-mail.');
          window.location.href = 'index.html';
        }
      }
    });
  }

  // ========== PROTEÇÃO DA PÁGINA PRINCIPAL ==========
  const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  
  if (isIndexPage) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.href = 'login.html';
    } else {
      const userDisplay = document.getElementById('userEmail');
      if (userDisplay) userDisplay.textContent = session.user.email;
    }
  }
});

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}