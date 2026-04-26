const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

function extrairCodigo(valor) {
  const m = String(valor || "").match(/4\d{10}/);
  return m ? m[0] : null;
}

function enviarParaTodos(dados) {
  const msg = JSON.stringify(dados);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", ws => {
  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "scan") {
        const id = extrairCodigo(data.valor);
        const rota = data.rota || "";

        const resposta = {
          type: "scan",
          rota,
          valorOriginal: data.valor,
          id,
          status: id ? "LIDO" : "INVALIDO",
          cor: id ? "green" : "red",
          hora: new Date().toLocaleTimeString("pt-BR")
        };

        enviarParaTodos(resposta);
      }
    } catch (e) {
      console.log("Erro:", e);
    }
  });
});

server.listen(PORT, () => {
  console.log("Rodando na porta:", PORT);
});
