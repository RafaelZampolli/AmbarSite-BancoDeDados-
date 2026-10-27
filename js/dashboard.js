const SUPABASE_URL = 'https://payyhgojskahdgwnzdnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXloZ29qc2thaGRnd256ZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc1MDMsImV4cCI6MjEwODcwMzUwM30.Dd4v4_aCFKOZaRTDxpWY1Le-tIINGbk_5ZnqmwyXeX8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userEmail = session.user.email;
  document.getElementById('userEmail').textContent = userEmail;

  // Verifica permissão
  const { data: perfil, error } = await supabaseClient
    .from('perfis')
    .select('role')
    .eq('email', userEmail)
    .single();

  if (error || !perfil || (perfil.role !== 'funcionario' && perfil.role !== 'admin')) {
    document.getElementById('acessoNegado').style.display = 'block';
    document.getElementById('painelAtendimento').style.display = 'none';
  } else {
    document.getElementById('acessoNegado').style.display = 'none';
    document.getElementById('painelAtendimento').style.display = 'block';
    carregarPedidos();
  }
});

async function carregarPedidos() {
  const container = document.getElementById('listaPedidos');
  container.innerHTML = '<p>Buscando pedidos...</p>';

  const { data, error } = await supabaseClient
    .from('contatos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = '<p>Erro ao carregar pedidos.</p>';
    return;
  }

  if (data.length === 0) {
    container.innerHTML = '<p>Nenhum pedido pendente.</p>';
    return;
  }

  container.innerHTML = '';
  data.forEach(pedido => {
    const card = document.createElement('div');
    card.className = 'card card--problem fade-in visible';
    
    const isRespondido = pedido.status === 'respondido';
    const bgColor = isRespondido ? '#25D366' : '#f5b041';
    const statusTexto = isRespondido ? 'Respondido' : 'Pendente';

    const assunto = encodeURIComponent(`Re: Contato Ambar Web - ${pedido.negocio}`);
    const corpo = encodeURIComponent(`Olá, ${pedido.nome}!\n\nRecebemos sua mensagem sobre ${pedido.negocio}.\n\n[Escreva sua resposta aqui]\n\nAtenciosamente,\nEquipe Ambar Web`);
    
    // LINK FORÇANDO ABRIR NO NAVEGADOR (GMAIL WEB)
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${pedido.email}&su=${assunto}&body=${corpo}`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <h3>${pedido.nome}</h3>
        <span style="background: ${bgColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${statusTexto}</span>
      </div>
      <p style="font-size: 0.8rem; margin-bottom: 10px;"><strong>E-mail:</strong> ${pedido.email}</p>
      <p style="font-size: 0.8rem; margin-bottom: 10px;"><strong>Negócio:</strong> ${pedido.negocio}</p>
      <p style="margin: 10px 0; font-style: italic; font-size: 0.9rem;">"${pedido.mensagem}"</p>
      
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <a href="${gmailLink}" target="_blank" class="btn btn--primary btn--sm" style="flex: 1; text-align: center;">
          Abrir no Gmail
        </a>
        
        <!-- O ID vai entre aspas simples: '${pedido.id}' para o UUID funcionar -->
        <button 
          onclick="marcarComoRespondido('${pedido.id}')" 
          class="btn ${isRespondido ? 'btn--ghost' : 'btn--primary'} btn--sm" 
          style="flex: 1;"
          ${isRespondido ? 'disabled' : ''}
        >
          ${isRespondido ? 'Já Respondido' : 'Marcar Respondido'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function marcarComoRespondido(id) {
  if (!confirm('Você já enviou o e-mail para este cliente? Deseja marcar como respondido?')) {
    return;
  }

  // Atualiza passando o UUID como string
  const { data, error } = await supabaseClient
    .from('contatos')
    .update({ status: 'respondido' })
    .eq('id', id)
    .select();

  if (error) {
    alert('Erro no banco: ' + error.message);
  } else if (data.length === 0) {
    alert('Nenhum pedido foi atualizado. Verifique se o ID existe.');
  } else {
    carregarPedidos(); 
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}