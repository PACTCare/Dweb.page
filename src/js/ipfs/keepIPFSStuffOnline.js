import shuffleArray from '../helperFunctions/shuffelArray';
import { LIST_OF_IPFS_GATEWAYS, DISTRIBUTION_NODES_NR } from './ipfsConfig';

/**
 * Spreads the word and makes sure a publicly uploaded files sticks around.
 * Might be problematic once a lot of people start using the tool.
 * @param {string} fileId
 * @param {string} gateway
 */
export default function keepIPFSStuffOnline(fileId, gateway) {
  const index = LIST_OF_IPFS_GATEWAYS.indexOf(gateway);
  if (index > -1) {
    LIST_OF_IPFS_GATEWAYS.splice(index, 1);
  }
  const shuffeledList = shuffleArray(LIST_OF_IPFS_GATEWAYS);
  const randomList = shuffeledList.slice(0, DISTRIBUTION_NODES_NR);
  for (let i = 0; i < randomList.length; i += 1) {
    const url = randomList[i] + fileId;
    const imageObject = new Image();
    imageObject.src = url;
  }
}
