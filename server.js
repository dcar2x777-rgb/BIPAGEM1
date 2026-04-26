const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

let rotas = {};

function extrairCodigo(valor) {
  const m = String(valor).match(/4\d{10}/);
  return m ? m[0] : null;
}

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "scan") {
      const id = extrairCodigo(data.valor);
      let cor = "red";

      if (!id) cor = "red";
      else cor = "green";

      ws.send(JSON.stringify({ cor }));
    }
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Rodando em http://localhost:3000");
});