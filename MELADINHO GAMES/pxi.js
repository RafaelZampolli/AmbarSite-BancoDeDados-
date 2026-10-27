// netlify/functions/pix.js
// Gera uma cobrança Pix via Woovi (https://woovi.com)
// A chave da API fica na variável de ambiente PIX_API_KEY (Netlify)

exports.handler = async (event) => {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método não permitido" };
  }

  try {
    const { valor, pedidoId } = JSON.parse(event.body);

    if (!valor || !pedidoId) {
      return { statusCode: 400, body: JSON.stringify({ erro: "valor e pedidoId são obrigatórios" }) };
    }

    const resposta = await fetch("https://api.woovi.com/api/v1/charge", {
      method: "POST",
      headers: {
        "Authorization": process.env.PIX_API_KEY,   // ← configurada no Netlify
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correlationID: pedidoId,
        value: Math.round(valor * 100),             // Woovi usa centavos
        comment: "Pedido Meladinhos Games"
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return { statusCode: resposta.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        copiaCola: data.charge.brCode,        // código "copia e cola"
        qrcode: data.charge.qrCodeImage       // imagem base64 do QR
      })
    };

  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: erro.message })
    };
  }
};