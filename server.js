const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let nextId = 1;
const clientes = new Map();

wss.on("connection", (ws) => {
  ws.clientId = String(nextId++);
  clientes.set(ws.clientId, ws);

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "scan") {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "scan",
              valorOriginal: data.valor,
              rota: data.rota,
              operador: data.operador || "",
              socketId: ws.clientId
            }));
          }
        });
      }

      if (data.type === "resultado") {
        const celular = clientes.get(String(data.socketId));
        if (celular && celular.readyState === WebSocket.OPEN) {
          celular.send(JSON.stringify({
            type: "feedback",
            cor: data.cor
          }));
        }
      }

    } catch (e) {
      console.log("Erro:", e);
    }
  });

  ws.on("close", () => {
    clientes.delete(ws.clientId);
  });
});

server.listen(PORT, () => {
  console.log("Rodando na porta:", PORT);
});
