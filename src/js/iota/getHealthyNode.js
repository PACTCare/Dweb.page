import IOTA from 'iota.lib.js';

// TODO: add more potential nodes
const NODES = [
  'https://nodes.thetangle.org:443',
  'https://pow4.iota.community:443',
  'https://iota-3.de:14267',
  'https://pow3.iota.community:443',
  'https://pool.trytes.eu',
  'https://pow6.iota.community:443',
];

async function getHealthStatus(iotaNode) {
  return new Promise((resolve, reject) => {
    iotaNode.api.setApiTimeout(10000);
    iotaNode.api.getNodeInfo((error, success) => {
      if (error) {
        return reject(error);
      }
      return resolve(success);
    });
  });
}

/**
 * Returns healthy IOTA Node
 */
export default async function getHealthyNode() {
  for (let i = 0; i < NODES.length; i += 1) {
    const node = NODES[i];
    const iotaNode = new IOTA({ provider: node });
    try {
      // eslint-disable-next-line no-await-in-loop
      const nodeHealth = await getHealthStatus(iotaNode);
      console.log(nodeHealth);
      if (nodeHealth.latestMilestone === nodeHealth.latestSolidSubtangleMilestone
        && nodeHealth.latestMilestoneIndex === nodeHealth.latestSolidSubtangleMilestoneIndex) {
        console.log('healthy');
        console.log(node);
        return iotaNode;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return undefined;
}
