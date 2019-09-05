import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

// TODO: Improve settings
// https://github.com/orbitdb/orbit-db/blob/master/examples/browser/example.js
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true,
  },
  config: {
    Addresses: {
      Swarm: [
        // TODO: Own IPFS signalling server
        // https://github.com/libp2p/js-libp2p-webrtc-star#hosted-signalling-server
        // /dns/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
      ],
    },
  },
};

/**
 * Start IPFS and orbitDB
 */
export default async function startIPFS() {
  // FIXME: Doesn't work on brave
  console.log('Starting ipfs and orbitdb...');
  window.ipfsNode = await IPFS.create(ipfsOptions);
  window.orbitdb = await OrbitDB.createInstance(window.ipfsNode);
}
