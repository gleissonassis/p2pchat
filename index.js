import Peer from './Peer.js';
import { IdentityHelper } from 'encryptify-lib';

if (!process.env.PORT) {
  throw Error('Variável de ambiente PORT não informada');
}

const port = process.env.PORT;

const timestamp = Date.now();
const randomNumber = Math.floor(Math.random() * 10000);
const myKey = IdentityHelper.generateHash(
  `${port}/${timestamp}/${randomNumber}`
);

const receivedMessageSignatures = [];

console.log('Porta', port);

const peer = new Peer(port);

process.argv
  .slice(2)
  .forEach(otherPeerAddress => peer.connectTo(otherPeerAddress));

peer.onConnection = socket => {
  const message = `Hi! I'm on port ${port}`;
  const signature = IdentityHelper.generateHash(
    `${message}/${myKey}/${Date.now()}`
  );

  receivedMessageSignatures.push(signature);

  const firstPayload = {
    message,
    signature,
  };

  socket.write(JSON.stringify(firstPayload));
};

peer.onData = (socket, data) => {
  const json = data.toString();
  const payload = JSON.parse(json);

  if (receivedMessageSignatures.includes(payload.signature)) return;

  receivedMessageSignatures.push(payload.signature);

  console.log('recebido > ', payload.message);

  peer.broadcast(json);
};

process.stdin.on('data', data => {
  const message = data.toString().replace(/\n/g, '');
  const signature = IdentityHelper.generateHash(
    `${message}/${myKey}/${Date.now()}`
  );
  receivedMessageSignatures.push(signature);
  peer.broadcast(JSON.stringify({ message, signature }));
});
