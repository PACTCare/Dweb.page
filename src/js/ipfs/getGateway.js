/**
 * Get the current gateway address
 * @returns {string} gateway address
 */
export default function getGateway() {
  const uniqueIPFSPart = '/ipfs/';
  let gateway = window.location.href;
  if (gateway.includes(uniqueIPFSPart)) {
    const [address] = gateway.split(uniqueIPFSPart);
    gateway = address + uniqueIPFSPart;
  }
  return gateway;
}
