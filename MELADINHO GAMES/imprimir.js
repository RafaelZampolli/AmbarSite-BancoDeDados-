exports.handler = async (event) => {
  const pedido = JSON.parse(event.body);
  const texto = `
  =============================
      MELADINHOS GAMES
  =============================
  Pedido: ${pedido.id}
  Cliente: ${pedido.cliente}
  Endereço: ${pedido.endereco}
  -----------------------------
  ${pedido.itens.map(i => `${i.qtd}x ${i.nome}`).join('\n')}
  -----------------------------
  TOTAL: R$ ${pedido.total.toFixed(2)}
  Pagamento: ${pedido.pagamento}
  =============================
  `;
  await fetch("https://api.printerco.com.br/v1/print", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PRINTER_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      printerId: process.env.PRINTER_ID,
      content: texto
    })
  });
  return { statusCode: 200, body: "ok" };
};