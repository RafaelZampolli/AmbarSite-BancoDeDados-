const SUPABASE_URL = 'https://payyhgojskahdgwnzdnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXloZ29qc2thaGRnd256ZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc1MDMsImV4cCI6MjEwODcwMzUwM30.Dd4v4_aCFKOZaRTDxpWY1Le-tIINGbk_5ZnqmwyXeX8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserEmail = '';
let currentUserRole = 'cliente';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  currentUserEmail = session.user.email;
  document.getElementById('userEmail').textContent = currentUserEmail;

  const { data: perfil } = await supabaseClient.from('perfis').select('role').eq('email', currentUserEmail).single();
  
  if (!perfil || (perfil.role !== 'funcionario' && perfil.role !== 'admin')) {
    alert('Acesso restrito.'); window.location.href = 'index.html'; return;
  }
  
  currentUserRole = perfil.role;

  // Se for admin, mostra o botão de criar projeto
  if (currentUserRole === 'admin') {
    document.getElementById('btnNovoProjeto').style.display = 'block';
  }

  carregarTudo();
});

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
  const { data: pedidos } = await supabaseClient.from('contatos').select('status');
  if (pedidos) {
    document.getElementById('statPendentes').textContent = pedidos.filter(p => p.status !== 'respondido').length;
    document.getElementById('statRespondidos').textContent = pedidos.filter(p => p.status === 'respondido').length;
  }
  const { data: projetos } = await supabaseClient.from('projetos').select('id');
  if (projetos) document.getElementById('statProjetos').textContent = projetos.length;
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

  // Filtra: Admin vê tudo, Funcionário vê só os dele
  let query = supabaseClient.from('projetos').select('*');
  if (currentUserRole !== 'admin') {
    query = query.eq('responsavel', currentUserEmail);
  }
  const { data: projetos } = await query;

  if (!projetos || projetos.length === 0) return container.innerHTML = '<p>Nenhum projeto encontrado.</p>';

  container.innerHTML = '';

  for (let proj of projetos) {
    const { data: tarefas } = await supabaseClient.from('checklist').select('*').eq('projeto_id', proj.id);
    
    let tarefasHTML = '<div style="background:var(--bg); padding:10px; border-radius:8px; margin-top:10px;">';
    if (tarefas && tarefas.length > 0) {
      tarefasHTML += tarefas.map(t => `
        <label class="checkbox-item">
          <input type="checkbox" ${t.concluido ? 'checked' : ''} onchange="toggleTarefa('${t.id}', this.checked)">
          <span style="${t.concluido ? 'text-decoration:line-through; color:var(--muted)' : ''}">${t.tarefa}</span>
        </label>
      `).join('');
    } else {
      tarefasHTML += '<p style="font-size:0.8rem; color:var(--muted); margin:0;">Nenhuma tarefa pendente.</p>';
    }
    tarefasHTML += '</div>';

    // Se for admin, mostra botões de editar e adicionar tarefa
    const botoesAdmin = currentUserRole === 'admin' ? `
      <div style="display:flex; gap:10px; margin-top:15px;">
        <button onclick="abrirModalTarefa('${proj.id}')" class="btn btn--ghost btn--sm" style="flex:1;">+ Tarefa</button>
        <button onclick="abrirModalProjeto('${proj.id}', '${proj.nome}', '${proj.status}', '${proj.responsavel}', '${proj.repo_url}')" class="btn btn--primary btn--sm" style="flex:1;">Editar</button>
      </div>
    ` : '';

    const card = `
      <div class="data-card">
        <h4>${proj.nome}</h4>
        <p>Status: <strong>${proj.status}</strong> | Resp: ${proj.responsavel.split('@')[0]}</p>
        <p>Link: <a href="${proj.repo_url}" target="_blank" style="color:var(--amber);">Repositório</a></p>
        ${tarefasHTML}
        ${botoesAdmin}
      </div>
    `;
    container.innerHTML += card;
  }
}

async function toggleTarefa(id, status) {
  await supabaseClient.from('checklist').update({ concluido: status }).eq('id', id);
  carregarProjetos();
}

// --- MODAIS DE PROJETO ---
function abrirModalProjeto(id = '', nome = '', status = 'Em andamento', resp = '', repo = '') {
  document.getElementById('projetoId').value = id;
  document.getElementById('projetoNome').value = nome;
  document.getElementById('projetoStatus').value = status;
  document.getElementById('projetoResp').value = resp;
  document.getElementById('projetoRepo').value = repo;
  
  document.getElementById('tituloModalProjeto').textContent = id ? 'Editar Projeto' : 'Novo Projeto';
  document.getElementById('modalProjeto').style.display = 'flex';
}

function fecharModalProjeto() {
  document.getElementById('modalProjeto').style.display = 'none';
}

async function salvarProjeto() {
  const id = document.getElementById('projetoId').value;
  const nome = document.getElementById('projetoNome').value;
  const status = document.getElementById('projetoStatus').value;
  const responsavel = document.getElementById('projetoResp').value;
  const repo_url = document.getElementById('projetoRepo').value;

  if (!nome || !responsavel) return alert('Preencha o nome e o responsável.');

  if (id) {
    // Editar projeto existente
    const { error } = await supabaseClient.from('projetos').update({ nome, status, responsavel, repo_url }).eq('id', id);
    if (error) alert('Erro ao editar: ' + error.message);
  } else {
    // Criar novo projeto
    const { error } = await supabaseClient.from('projetos').insert([{ nome, status, responsavel, repo_url }]);
    if (error) alert('Erro ao criar: ' + error.message);
  }
  
  fecharModalProjeto();
  carregarTudo();
}

// --- MODAIS DE TAREFA ---
function abrirModalTarefa(projetoId) {
  document.getElementById('tarefaProjetoId').value = projetoId;
  document.getElementById('tarefaTexto').value = '';
  document.getElementById('modalTarefa').style.display = 'flex';
}

function fecharModalTarefa() {
  document.getElementById('modalTarefa').style.display = 'none';
}

async function salvarTarefa() {
  const projeto_id = document.getElementById('tarefaProjetoId').value;
  const tarefa = document.getElementById('tarefaTexto').value;

  if (!tarefa) return alert('Digite a tarefa.');

  const { error } = await supabaseClient.from('checklist').insert([{ projeto_id, tarefa, concluido: false }]);
  if (error) alert('Erro ao adicionar tarefa: ' + error.message);
  
  fecharModalTarefa();
  carregarProjetos();
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}