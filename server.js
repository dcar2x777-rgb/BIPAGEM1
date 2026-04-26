const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// guarda conexões
wss.on("connection", (ws) => {

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // mensagem do celular
      if (data.type === "scan") {

        // manda pro PC (painel)
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "scan",
              valorOriginal: data.valor,
              rota: data.rota,
              socketId: ws._socket.remotePort
            }));
          }
        });

      }

      // resposta do PC (validação)
      if (data.type === "resultado") {

        // devolve só pro celular que enviou
        wss.clients.forEach(client => {
          if (client._socket.remotePort == data.socketId) {
            client.send(JSON.stringify({
              type: "feedback",
              cor: data.cor
            }));
          }
        });

      }

    } catch (e) {
      console.log("Erro:", e);
    }
  });

});

server.listen(PORT, () => {
  console.log("Rodando:", PORT);
});
