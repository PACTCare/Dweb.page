import { TANGLE_EXPLORER } from './iotaConfig';

function test(url) {
  return fetch(url, { mode: 'no-cors' });
}

/**
 * Returns working tangle explorer address
 */
export default async function getTangleExplorer() {
  let tangleExplorerAddress;
  for (let i = 0; i < TANGLE_EXPLORER.length; i += 1) {
    tangleExplorerAddress = TANGLE_EXPLORER[i];
    // eslint-disable-next-line no-await-in-loop
    const reply = await test(tangleExplorerAddress);
    if (reply.type === 'opaque') {
      break;
    }
  }
  return `${tangleExplorerAddress}/address/`;
}
