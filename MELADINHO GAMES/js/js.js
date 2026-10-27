// ============ CONFIGURAÇÕES (VOCÊ PREENCHE) ============
const CONFIG = {
  // PIX — escolha um gateway e cole aqui
  PIX_ENDPOINT: "https://api.woovi.com/api/v1/charge", // ou Pagar.me, Mercado Pago...
  PIX_API_KEY: "COLE_SUA_CHAVE_AQUI",
  PIX_APP_ID: "COLE_SEU_APP_ID_AQUI",

  // IMPRESSORA TÉRMICA — endpoint do serviço de cloud printing
  IMPRESSORA_ENDPOINT: "https://api.printerco.com.br/v1/print",
  IMPRESSORA_TOKEN: "COLE_SEU_TOKEN_AQUI",
  IMPRESSORA_ID: "COLE_ID_DA_IMPRESSORA_AQUI"
};

// ============ ESTADO ============
let produtos = [];
let carrinho = [];

// ============ CARREGAR PRODUTOS ============
async function carregarProdutos() {
  try {
    const res = await fetch('data/produtos.json');
    const data = await res.json();
    produtos = data.produtos;
    renderizarProdutos();
  } catch (e) {
    console.error("Erro ao carregar cardápio:", e);
  }
}

function renderizarProdutos() {
  const grid = document.getElementById('produtos-grid');
  grid.innerHTML = produtos.map(p => `
    <div class="produto-card">
      <img src="${p.imagem}" alt="${p.nome}" onerror="this.src='https://via.placeholder.com/400x160/12122a/0ff?text=${encodeURIComponent(p.nome)}'">
      <div class="info">
        <h4>${p.nome}</h4>
        <p class="desc">${p.descricao}</p>
        <div class="preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        <button onclick="adicionarAoCarrinho(${p.id})">+ Adicionar</button>
      </div>
    </div>
  `).join('');
}

// ============ CARRINHO ============
window.adicionarAoCarrinho = function(id) {
  const prod = produtos.find(p => p.id === id);
  const item = carrinho.find(i => i.id === id);
  if (item) item.qtd++;
  else carrinho.push({ ...prod, qtd: 1 });
  renderizarCarrinho();
};

function renderizarCarrinho() {
  const div = document.getElementById('itens-carrinho');
  div.innerHTML = carrinho.map(i => `
    <div class="item-carrinho">
      <span>${i.qtd}x ${i.nome}</span>
      <span>R$ ${(i.preco * i.qtd).toFixed(2).replace('.', ',')}</span>
      <button onclick="removerDoCarrinho(${i.id})">×</button>
    </div>
  `).join('') || '<p style="opacity:.6">Carrinho vazio</p>';

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

window.removerDoCarrinho = function(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  renderizarCarrinho();
};

// ============ CHECKOUT ============
document.getElementById('btn-checkout').addEventListener('click', () => {
  if (carrinho.length === 0) return alert("Adicione itens ao carrinho!");
  document.getElementById('modal-checkout').classList.remove('hidden');
});

document.getElementById('btn-fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-checkout').classList.add('hidden');
});

document.getElementById('pagamento').addEventListener('change', (e) => {
  document.getElementById('pix-area').classList.toggle('hidden', e.target.value !== 'pix');
});

// ============ GERAR PIX ============
// ============ GERAR PIX (com modo de teste) ============
async function gerarPix(valor, pedidoId) {
    // 🔧 MODO DE TESTE: se não houver backend configurado, simula um Pix
    const MODO_TESTE = true; // ← mude para false quando tiver a chave real

    if (MODO_TESTE) {
        // Simula uma resposta de Pix falso para testar o layout
        await new Promise(r => setTimeout(r, 800)); // finge que está processando
        return {
            copiaCola: "00020126580014br.gov.bcb.pix0136TESTE-MELADINHOS-GAMES" + pedidoId + "5204000053039865802BR5913MELADINHOS6009SAO PAULO62070503***6304ABCD",
            qrcode: null // o QR será gerado no front com a lib qrcodejs
        };
    }

    // Modo real (quando tiver a chave)
    const res = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, pedidoId })
    });

    if (!res.ok) throw new Error("Falha ao gerar Pix");
    return res.json();
}

// ============ IMPRESSÃO TÉRMICA ============
// ============ IMPRESSÃO (com modo de teste) ============
async function imprimirPedido(pedido) {
    const MODO_TESTE = true; // ← mude para false quando tiver o token real

    if (MODO_TESTE) {
        console.log("🖨️ [MODO TESTE] Pedido que seria impresso:", pedido);
        await new Promise(r => setTimeout(r, 500));
        return true;
    }

    const res = await fetch('/api/imprimir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
    return res.ok;
}

// ============ CONFIRMAR PEDIDO ============
document.getElementById('btn-confirmar').addEventListener('click', async () => {
  const nome = document.getElementById('nome-cliente').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const pagamento = document.getElementById('pagamento').value;

  if (!nome || !endereco) return alert("Preencha nome e endereço!");

  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const pedidoId = 'MG' + Date.now();

  const pedido = {
    id: pedidoId,
    cliente: nome,
    endereco,
    pagamento,
    itens: carrinho.map(i => ({ nome: i.nome, qtd: i.qtd, preco: i.preco })),
    total,
    criadoEm: new Date().toISOString()
  };

    if (pagamento === 'pix') {
        try {
            const pix = await gerarPix(total, pedidoId);
            document.getElementById('qrcode').innerHTML = '';
            new QRCode(document.getElementById('qrcode'), {
                text: pix.copiaCola, width: 200, height: 200
            });
            document.getElementById('pix-copia-cola').value = pix.copiaCola;
        } catch (e) {
            alert("Erro ao gerar Pix. Verifique a configuração.");
        }
    }
});

// ============ INIT ============
carregarProdutos();
renderizarCarrinho();