import net from 'net';

export default class Peer {
  constructor(port) {
    this.port = port;
    this.connections = [];

    const server = net.createServer(socket => {
      console.log('alguém connectou');
      this.onSocketConnected(socket);
    });

    server.listen(port, () => console.log(`Ouvindo porta ${port}`));
  }

  connectTo(address) {
    if (address.split(':').length !== 2) {
      throw Error('O endereço do outro peer deve ser composto por host:port');
    }

    const [host, port] = address.split(':');
    const socket = net.createConnection({ port, host }, () =>
      console.log('Conexão criada')
    );

    this.onSocketConnected(socket);
  }

  onSocketConnected(socket) {
    console.log('Nova conexão');
    this.connections.push(socket);

    this.onConnection(socket);
    socket.on('data', data => this.onData(socket, data));

    socket.on('close', () => {
      this.connections = this.connections.filter(conn => {
        return conn !== socket;
      });
    });
  }

  onData(socket, data) {
    console.log('received: ', data.toString());
  }

  onConnection() {}

  broadcast(data) {
    this.connections.forEach(socket => socket.write(data));
  }
};
