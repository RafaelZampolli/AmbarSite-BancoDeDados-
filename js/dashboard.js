const SUPABASE_URL = 'https://payyhgojskahdgwnzdnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXloZ29qc2thaGRnd256ZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc1MDMsImV4cCI6MjEwODcwMzUwM30.Dd4v4_aCFKOZaRTDxpWY1Le-tIINGbk_5ZnqmwyXeX8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let pedidoAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const userEmail = session.user.email;
  document.getElementById('userEmail').textContent = userEmail;

  // VERIFICA SE O CARGO É FUNCIONÁRIO OU ADMIN
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
    container.innerHTML = '<p>Nenhum pedido pendente no momento.</p>';
    return;
  }

  container.innerHTML = '';
  data.forEach(pedido => {
    const card = document.createElement('div');
    card.className = 'card card--problem fade-in visible';
    
    // Se já foi respondido, mostra a resposta
    const statusBadge = pedido.status === 'respondido' 
      ? `<span style="background: #25D366; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">Respondido</span>` 
      : `<span style="background: #f5b041; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">Pendente</span>`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <h3>${pedido.nome}</h3>
        ${statusBadge}
      </div>
      <p style="font-size: 0.8rem; margin-bottom: 10px;"><strong>E-mail:</strong> ${pedido.email}</p>
      <p style="font-size: 0.8rem; margin-bottom: 10px;"><strong>Negócio:</strong> ${pedido.negocio}</p>
      <p style="margin: 10px 0; font-style: italic; font-size: 0.9rem;">"${pedido.mensagem}"</p>
      ${pedido.resposta ? `<div style="background: #f5f0e8; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 0.85rem;"><strong>Sua resposta:</strong> ${pedido.resposta}</div>` : ''}
      <button onclick="abrirModal(${pedido.id}, '${pedido.nome}')" class="btn btn--primary btn--sm" style="margin-top: 10px; width: 100%;">
        ${pedido.resposta ? 'Editar Resposta' : 'Responder'}
      </button>
    `;
    container.appendChild(card);
  });
}

function abrirModal(id, nome) {
  pedidoAtual = id;
  document.getElementById('modalPedidoInfo').textContent = `Respondendo para: ${nome}`;
  document.getElementById('textoResposta').value = ''; // Limpa o campo
  document.getElementById('modalResposta').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modalResposta').style.display = 'none';
  document.getElementById('textoResposta').value = '';
  pedidoAtual = null;
}

async function enviarResposta() {
  const resposta = document.getElementById('textoResposta').value;
  if (!resposta) return alert('Digite uma resposta.');

  const { error } = await supabaseClient
    .from('contatos')
    .update({ resposta: resposta, status: 'respondido' })
    .eq('id', pedidoAtual);

  if (error) {
    alert('Erro ao salvar resposta: ' + error.message);
  } else {
    alert('Resposta enviada com sucesso!');
    fecharModal();
    carregarPedidos();
  }
}

// Logout padrão
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}