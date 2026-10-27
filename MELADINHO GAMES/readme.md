# 🎮 Meladinhos Games — Guia de Instalação

## ✅ O QUE JÁ ESTÁ PRONTO
- Landing page responsiva com tema gamer
- Cardápio dinâmico (lê do produtos.json)
- Carrinho de compras
- Modal de checkout com Pix
- Painel admin para adicionar/remover produtos
- Estrutura de integração com Pix e impressora térmica

## 🔧 O QUE VOCÊ PRECISA FAZER (5 passos)

### 1. Subir o site
- Opção A (grátis): crie conta em https://netlify.com → arraste a pasta do projeto
- Opção B: hospedagem normal (Hostinger, KingHost) → suba via FTP

### 2. Contratar Gateway Pix
- **Woovi** (https://woovi.com) — recomendo, tem API simples
- **Pagar.me** (https://pagar.me)
- **Mercado Pago** (https://mercadopago.com.br)

Depois de criar conta, pegue sua **API Key** e cole em `js/app.js` na variável `CONFIG`.

### 3. Contratar Impressão em Nuvem
- **PrinterCo** (https://printerco.com.br) — funciona com Epson e Star
- **BizPrint** (https://bizprint.com.br)
- Alternativa gratuita: rodar **PrintNode** no PC ligado à impressora

Depois pegue o **Token** e o **ID da impressora** e cole em `js/app.js`.

### 4. Criar o Backend (obrigatório para segurança)
As chamadas de Pix e impressão NÃO podem ficar no navegador
(sua chave seria exposta). Crie estas 2 funções no Netlify:

**netlify/functions/pix.js**
```javascript
exports.handler = async (event) => {
  const { valor, pedidoId } = JSON.parse(event.body);
  const res = await fetch("https://api.woovi.com/api/v1/charge", {
    method: "POST",
    headers: {
      "Authorization": process.env.PIX_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      correlationID: pedidoId,
      value: Math.round(valor * 100),
      comment: "Pedido Meladinhos Games"
    })
  });
  const data = await res.json();
  return { statusCode: 200, body: JSON.stringify({
    copiaCola: data.charge.brCode,
    qrcode: data.charge.qrCodeImage
  })};
};