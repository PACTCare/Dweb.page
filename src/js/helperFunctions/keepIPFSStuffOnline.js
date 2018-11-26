/**
 * Spreads the word and makes sure a publicly uploaded files sticks around.
 * Might be problematic once a lot of people start using the tool.
 * @param {string} fileId
 */
export default function keepIPFSStuffOnline(fileId) {
  const listOfIPFSGateways = ['https://ipfs.io/ipfs/',
    'https://ipfs.infura.io/ipfs/',
    'https://pactcare.online/ipfs/',
    'https://ipfs.eternum.io/ipfs/',
    'https://untangle.care/ipfs/',
    'https://ipfs.adder.black/ipfs/'];
  function shuffle(a) {
    for (let i = a.length; i; i -= 1) {
      const j = Math.floor(Math.random() * i);
      [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }
  shuffle(listOfIPFSGateways);
  const randomList = listOfIPFSGateways.slice(0, 2);
  for (let i = 0; i < randomList.length; i += 1) {
    const url = randomList[i] + fileId;
    const imageObject = new Image();
    imageObject.src = url;
  }
}
