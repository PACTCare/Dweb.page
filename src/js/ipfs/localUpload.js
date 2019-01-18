/**
 * Uploads content locally, either via window.ipfs or XMLHttpRequest
 * @param {ArrayBuffer} buf
 * @param {String} gateway
 */
export default async function localUpload(buf, gateway) {
  try {
    if (window.ipfs) {
      if (window.ipfs.enable) {
        const ipfsCompanion = await window.ipfs.enable({ commands: ['id', 'dag', 'version'] });
        const [{ hash }] = await ipfsCompanion.add(Buffer.from(buf));
        return hash;
      }
      const [{ hash }] = await window.ipfs.add(Buffer.from(buf));
      return hash;
    }
  } catch (error) {
    console.error(Error.IPFS_COMPANION);
  }
  return new Promise(((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', gateway, true);
    xhr.onreadystatechange = function onreadystatechange() {
      if (this.readyState === this.HEADERS_RECEIVED) {
        return resolve(xhr.getResponseHeader('ipfs-hash'));
      }
    };
    xhr.onerror = function onError() {
      return resolve(undefined);
    };
    xhr.send(new Blob([buf]));
  }));
}
