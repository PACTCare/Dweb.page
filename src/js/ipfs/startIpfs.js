import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider';

// TODO: Improve settings
// https://github.com/orbitdb/orbit-db/blob/master/examples/browser/example.js
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true,
  },
  // TODO: Own IPFS signalling server or remove if js ipfs improved
  config: {
    Addresses: {
      Swarm: [
        // https://github.com/libp2p/js-libp2p-webrtc-star#hosted-signalling-server
        // /dns/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star/
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
      ],
    },
  },
};

/**
 * Register own database publicly
 * @param {orbitDB} metadataRegistry
 */
async function registerDatabase(metadataRegistry) {
  const isRegistered = localStorage.getItem('register');
  if (isRegistered === null) {
    metadataRegistry.add({ address: window.metadataDb.address.toString() });
    window.localStorage.setItem('register', 'true');
  }
}

/**
 * Loads Metadata databases and metadata from public shared database
 * @param {orbitDB} metadataRegistry
 * @param {object} orbitdb
 */
async function loadMetadata(metadataRegistry, orbitdb) {
  const items = metadataRegistry.iterator().collect().map((e) => e.payload.value);
  let metadata = [];
  await Promise.all(items.map(async (e) => {
    console.log('shit');
    const db = await orbitdb.open(e.address.toString(), { indexBy: 'fileId' });
    await db.load();
    const back = await db.get('');
    metadata = metadata.concat(back);
    console.log(metadata);
  }));

  return metadata;
}

/**
 * Start IPFS and orbitDB
 */
export default async function startIpfs() {
  // FIXME: Doesn't work on brave
  console.log('Starting ipfs and orbitdb...');
  window.ipfsNode = await IPFS.create(ipfsOptions);

  const options = { id: 'local-id' };
  const identity = await Identities.createIdentity(options);
  const orbitdb = await OrbitDB.createInstance(window.ipfsNode, { identity });
  // each user has their own metadata database
  window.metadataDb = await orbitdb.docs('metadataDb', { indexBy: 'fileId' });
  await window.metadataDb.load();

  // TODO: Sharding of public database
  // Create Public Metadata Registry
  // const publicDb = {
  //   // Give write access to everyone
  //   accessController: {
  //     write: ['*'],
  //   },
  // };
  // const metadataRegistry = await orbitdb.eventlog('metadataRegistry', publicDb);

  // Connect to Public Metadata Registry
  const metadataRegistry = await orbitdb.open('/orbitdb/zdpuAwxsL6bPpUkmzRFuRzv513htstdndWHsfjgCHmaBuJw99/metadataRegistry');
  await metadataRegistry.load();
  await registerDatabase(metadataRegistry);

  // load all the other databases
  window.metadata = await loadMetadata(metadataRegistry, orbitdb);

  console.log(`Public Database Address: ${metadataRegistry.address.toString()}`);
  console.log(`Private Database Address: ${window.metadataDb.address.toString()}`);
}
