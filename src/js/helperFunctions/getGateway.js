export default function getGateway() {
  const HOST = window.location.hostname;
  const PROTOCOL = window.location.protocol;
  let gateway = 'http://localhost:8080/ipfs/';
  if (HOST !== 'localhost' && HOST !== '127.0.0.1') {
    gateway = `${PROTOCOL}//${HOST}/ipfs/`;
  }
  gateway = gateway.replace('index.html');
  return gateway;
}
