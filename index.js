const net = require('net');

const server = net.createServer(socket => {
  console.log('⚡️ Nueva conexión TCP entrante');

  socket.once('data', data => {
    const reqStr = data.toString();
    console.log('\n📥 Primera solicitud recibida del cliente:\n' + reqStr);

    // 🔑 Enviar banner SOLO al cliente que conecta a 8085
    const response = [
      'HTTP/1.1 101 <font color="#00FFFF">𝑆𝑈𝐵-𝑍𝐸𝑅𝑂</font>',
      'Upgrade: websocket',
      'Connection: Upgrade',
      '\r\n'
    ].join('\r\n');

    console.log('📤 Enviando respuesta 101 al cliente');
    socket.write(response);

    // 🔗 Conexión al servidor WebSocket modificado en 80
    const ws = net.connect({ host: '108.181.4.139', port: 80 }, () => {
      console.log('🔗 Conectado al servidor WebSocket modificado en 127.0.0.1:8080');

      // 🔄 Enviar primer mensaje modificado al servidor
      const firstMessage = [
        'GET / HTTP/1.1',
        'Host: 108.181.4.139',
        'Connection: Upgrade',
        'Upgrade: Websocket',
        '\r\n'
      ].join('\r\n');

      console.log('📤 Enviando primer mensaje modificado al servidor 8080');
      ws.write(firstMessage);
    });

    // 🔄 Reenvío transparente a partir del segundo mensaje
    socket.pipe(ws);
    ws.pipe(socket);

    // Manejo de errores
    ws.on('error', err => {
      console.error('❌ Error WebSocket modificado:', err.message);
    });

    socket.on('error', err => {
      console.error('❌ Error Socket:', err.message);
    });

    ws.on('close', () => {
      console.log('🔌 Conexión con WebSocket modificado cerrada');
      socket.end();
    });

    socket.on('close', () => {
      console.log('🔌 Conexión cliente cerrada');
      ws.end();
    });
  });
});

server.listen(8080, () => {
  console.log('✅ Servidor proxy escuchando en puerto 8085 (responde con banner en el status line)');
});
