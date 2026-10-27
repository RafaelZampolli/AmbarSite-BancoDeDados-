const SUPABASE_URL = 'https://payyhgojskahdgwnzdnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXloZ29qc2thaGRnd256ZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc1MDMsImV4cCI6MjEwODcwMzUwM30.Dd4v4_aCFKOZaRTDxpWY1Le-tIINGbk_5ZnqmwyXeX8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  currentUserEmail = session.user.email;
  document.getElementById('userEmail').textContent = currentUserEmail;

  const { data: perfil } = await supabaseClient.from('perfis').select('role').eq('email', currentUserEmail).single();
  
  if (!perfil || (perfil.role !== 'funcionario' && perfil.role !== 'admin')) {
    alert('Acesso restrito.'); window.location.href = 'index.html'; return;
  }

  carregarTudo();
});

// NAVEGAÇÃO DE ABAS
function mudarAba(abaId, btn) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar button').forEach(el => el.classList.remove('active'));
  document.getElementById(`aba-${abaId}`).classList.add('active');
  btn.classList.add('active');
}

async function carregarTudo() {
  await carregarPedidos();
  await carregarProjetos();
  await carregarEstatisticas();
}

async function carregarEstatisticas() {
  // Busca pedidos
  const { data: pedidos } = await supabaseClient.from('contatos').select('status');
  if (pedidos) {
    const pendentes = pedidos.filter(p => p.status !== 'respondido').length;
    const respondidos = pedidos.filter(p => p.status === 'respondido').length;
    document.getElementById('statPendentes').textContent = pendentes;
    document.getElementById('statRespondidos').textContent = respondidos;
  }

  // Busca projetos
  const { data: projetos } = await supabaseClient.from('projetos').select('id');
  if (projetos) {
    document.getElementById('statProjetos').textContent = projetos.length;
  }
}

// ========== PEDIDOS ==========
async function carregarPedidos() {
  const container = document.getElementById('listaPedidos');
  container.innerHTML = '<p>Buscando pedidos...</p>';

  const { data } = await supabaseClient.from('contatos').select('*').order('created_at', { ascending: false });
  if (!data || data.length === 0) return container.innerHTML = '<p>Nenhum pedido.</p>';

  container.innerHTML = data.map(pedido => {
    const isRespondido = pedido.status === 'respondido';
    const bgColor = isRespondido ? '#25D366' : '#f5b041';
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${pedido.email}&su=Re: Ambar Web - ${pedido.negocio}&body=Olá ${pedido.nome}, ...`;

    return `
      <div class="data-card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h4>${pedido.nome}</h4>
          <span style="background: ${bgColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">${isRespondido ? 'Respondido' : 'Pendente'}</span>
        </div>
        <p><strong>E-mail:</strong> ${pedido.email}</p>
        <p><strong>Negócio:</strong> ${pedido.negocio}</p>
        <p style="font-style: italic; margin-bottom: 15px;">"${pedido.mensagem}"</p>
        <div style="display: flex; gap: 10px; margin-top: auto;">
          <a href="${gmailLink}" target="_blank" class="btn btn--primary btn--sm" style="flex: 1; text-align: center;">Abrir no Gmail</a>
          <button onclick="marcarRespondido('${pedido.id}')" class="btn ${isRespondido ? 'btn--ghost' : 'btn--primary'} btn--sm" style="flex: 1;" ${isRespondido ? 'disabled' : ''}>
            ${isRespondido ? 'Concluído' : 'Responder'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function marcarRespondido(id) {
  if (!confirm('Confirmar que o e-mail foi enviado?')) return;
  const { error } = await supabaseClient.from('contatos').update({ status: 'respondido' }).eq('id', id).select();
  if (error) alert('Erro: ' + error.message);
  else carregarTudo(); 
}

// ========== PROJETOS E TAREFAS ==========
async function carregarProjetos() {
  const container = document.getElementById('listaProjetos');
  container.innerHTML = '<p>Buscando projetos...</p>';

  // Busca projetos (se não for admin, filtra apenas os dele)
  const { data: projetos } = await supabaseClient.from('projetos').select('*');
  if (!projetos || projetos.length === 0) return container.innerHTML = '<p>Nenhum projeto atribuído.</p>';

  container.innerHTML = '';

  for (let proj of projetos) {
    // Busca as tarefas deste projeto
    const { data: tarefas } = await supabaseClient.from('checklist').select('*').eq('projeto_id', proj.id);
    
    // Monta a lista de tarefas
    let tarefasHTML = '<p style="font-size:0.8rem; margin-top:10px;"><strong>Tarefas:</strong></p>';
    if (tarefas && tarefas.length > 0) {
      tarefasHTML += tarefas.map(t => `
        <label class="checkbox-item">
          <input type="checkbox" ${t.concluido ? 'checked' : ''} onchange="toggleTarefa('${t.id}', this.checked)">
          <span style="${t.concluido ? 'text-decoration:line-through; color:var(--muted)' : ''}">${t.tarefa}</span>
        </label>
      `).join('');
    } else {
      tarefasHTML += '<p style="font-size:0.8rem; color:var(--muted);">Nenhuma tarefa pendente.</p>';
    }

    const card = `
      <div class="data-card">
        <h4>${proj.nome}</h4>
        <p>Status: <strong>${proj.status}</strong></p>
        <p style="margin-bottom:15px;">Link: <a href="${proj.repo_url}" target="_blank" style="color:var(--amber);">Acessar Repositório</a></p>
        <div style="background:var(--bg); padding:10px; border-radius:8px;">
          ${tarefasHTML}
        </div>
      </div>
    `;
    container.innerHTML += card;
  }
}

async function toggleTarefa(id, status) {
  await supabaseClient.from('checklist').update({ concluido: status }).eq('id', id);
  // Recarrega apenas a aba de projetos para atualizar o visual
  carregarProjetos();
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}