
const net = require("net");
const express = require("express");
const http = require("http");

const app = express();

// 🔹 Health check de Cloud Run → siempre responde 200 OK en "/"
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

const server = http.createServer(app);

// 🔹 Aquí mantenemos tu lógica actual del fake 101 + banner
server.on("upgrade", (req, socket, head) => {
  console.log("⚡ Nueva conexión TCP entrante");

  // Respuesta 101 con banner
  const response = [
    'HTTP/1.1 101 <font color="#00FFFF">𝑆𝑈𝐵-𝑍𝐸𝑅𝑂</font>',
    'Upgrade: websocket',
    'Connection: Upgrade',
    '\r\n'
  ].join("\r\n");

  console.log("📤 Enviando respuesta 101 al cliente");
  //socket.write(response);

  // 🔗 Conexión a tu servidor backend en 108.181.4.139:80
  const ws = net.connect({ host: "5.34.178.42", port: 80 }, () => {
    console.log("🔗 Conectado al servidor backend en 108.181.4.139:80");

    // Primer mensaje "fake handshake" hacia el backend
    const firstMessage = [
      "GET / HTTP/1.1",
      "Host: 5.34.178.42",
      "Connection: Upgrade",
      "Upgrade: Websocket",
      "\r\n"
    ].join("\r\n");

    ws.write(firstMessage);
  });

  // Reenvío transparente
  socket.pipe(ws);
  ws.pipe(socket);

  ws.on("error", err => {
    console.error("❌ Error backend:", err.message);
  });

  socket.on("error", err => {
    console.error("❌ Error socket:", err.message);
  });

  ws.on("close", () => {
    console.log("🔌 Conexión backend cerrada");
    socket.end();
  });

  socket.on("close", () => {
    console.log("🔌 Conexión cliente cerrada");
    ws.end();
  });
});

// 🔹 Cloud Run obliga a usar process.env.PORT (default 8080)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`);
});
