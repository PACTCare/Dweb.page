import IOTA from 'iota.lib.js';
import shuffleArray from '../helperFunctions/shuffelArray';
import { NODES, NODE_TIMEOUT } from './iotaConfig';

async function getHealthStatus(iotaNode) {
  return new Promise((resolve, reject) => {
    iotaNode.api.setApiTimeout(NODE_TIMEOUT);
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
  const shuffeledNodes = shuffleArray(NODES);
  for (let i = 0; i < shuffeledNodes.length; i += 1) {
    const node = shuffeledNodes[i];
    const iotaNode = new IOTA({ provider: node });
    try {
      // eslint-disable-next-line no-await-in-loop
      const nodeHealth = await getHealthStatus(iotaNode);
      if (nodeHealth.latestMilestone === nodeHealth.latestSolidSubtangleMilestone
        && nodeHealth.latestMilestoneIndex === nodeHealth.latestSolidSubtangleMilestoneIndex) {
        return iotaNode;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return undefined;
}
