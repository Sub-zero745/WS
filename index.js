const net = require('net');

const CLIENT_PORT = 8080;
const SERVER_HOST = '5.34.178.42';
const SERVER_PORT = 80;

const server = net.createServer(client => {
  console.log('⚡️ Nueva conexión entrante al proxy 8080');

  // Conectar al servidor 8080
  const wsServer = net.connect({ host: SERVER_HOST, port: SERVER_PORT }, () => {
    console.log(`🔗 Conectado al servidor ${SERVER_HOST}:${SERVER_PORT}`);
  });

  // Enviar HTTP 101 al cliente inmediatamente
  const banner = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    '\r\n'
  ].join('\r\n');
  client.write(banner);
  console.log('📤 Enviado HTTP 101 al cliente');

  let packetCount = 0;
  let firstPacketHandled = false;

  // Datos del cliente -> servidor 8080
  client.on('data', data => {
    packetCount++;

    // Manejar solo el primer paquete para dividir WebSocket + SSH
    if (!firstPacketHandled) {
      const str = data.toString();
      const splitIndex = str.indexOf('SSH-2.0');

      if (splitIndex !== -1) {
        const wsPart = str.slice(0, splitIndex);
        const sshPart = str.slice(splitIndex);

        console.log('📤 Dividiendo primer paquete en WebSocket y SSH');

        wsServer.write(wsPart);  // enviar primero WebSocket
        wsServer.write(sshPart); // luego SSH
      } else {
        wsServer.write(data); // paquete normal
      }

      firstPacketHandled = true;
    } else {
      wsServer.write(data); // reenviar paquetes posteriores normalmente
    }
  });

  // Datos del servidor 8080 -> cliente
  wsServer.on('data', data => {
    client.write(data); // reenviar al cliente
  });

  // Manejo de errores
  client.on('error', e => console.error('Client error:', e.message));
  wsServer.on('error', e => console.error('Server error:', e.message));

  // Cierre de conexiones
  client.on('close', () => {
    console.log('🔌 Conexión con el cliente cerrada');
    wsServer.end();
  });

  wsServer.on('close', () => {
    console.log('🔌 Conexión con el servidor cerrada');
    client.end();
  });
});

server.listen(CLIENT_PORT, () => {
  console.log(`✅ Proxy 8080 listo, reenviando datos bidireccionalmente a ${SERVER_HOST}:${SERVER_PORT}`);
});
