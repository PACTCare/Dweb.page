/**
 * Remove object parts which aren't used for signing
 * @param {Object} obj
 * @returns {Object} obj
 */
export default function prepObjectForSignature(obj) {
  const localObj = obj;
  delete localObj.signature;
  delete localObj.address;
  delete localObj.tag;
  return localObj;
}
