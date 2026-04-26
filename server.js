const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🔥 IMPORTANTE (Render)
const PORT = process.env.PORT || 3000;

// Servir arquivos da pasta public
app.use(express.static("public"));

// Quando celular envia leitura
wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "scan") {
        console.log("BIPADO:", data.valor);

        // Aqui você pode validar rota depois
        ws.send(JSON.stringify({ cor: "green" }));
      }

    } catch (e) {
      console.log("Erro:", e);
    }
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log("Rodando na porta:", PORT);
});
