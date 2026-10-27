let produtos = [];

async function carregar() {
  const res = await fetch('data/produtos.json');
  const data = await res.json();
  produtos = data.produtos;
  renderTabela();
}

function renderTabela() {
  const tbody = document.getElementById('tabela-produtos');
  tbody.innerHTML = produtos.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>R$ ${p.preco.toFixed(2).replace('.', ',')}</td>
      <td style="opacity:.7; font-size:12px">${p.descricao}</td>
      <td><button onclick="remover(${p.id})">Remover</button></td>
    </tr>
  `).join('');
}

window.adicionarProduto = function () {
  const nome = document.getElementById('f-nome').value.trim();
  const preco = parseFloat(document.getElementById('f-preco').value);
  const descricao = document.getElementById('f-desc').value.trim();
  const imagem = document.getElementById('f-img').value.trim()
    || 'https://via.placeholder.com/400x160/12122a/0ff?text=Sem+Foto';

  if (!nome || isNaN(preco)) return alert("Preencha nome e preço!");

  const novoId = Math.max(0, ...produtos.map(p => p.id)) + 1;
  produtos.push({ id: novoId, nome, descricao, preco, imagem });
  renderTabela();

  document.getElementById('f-nome').value = '';
  document.getElementById('f-preco').value = '';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-img').value = '';
};

window.remover = function (id) {
  if (!confirm("Remover este produto?")) return;
  produtos = produtos.filter(p => p.id !== id);
  renderTabela();
};

window.salvarJSON = function () {
  const dataStr = JSON.stringify({ produtos }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'produtos.json';
  a.click();
  alert("Arquivo baixado! Envie para a pasta /data do seu site.");
};

carregar();