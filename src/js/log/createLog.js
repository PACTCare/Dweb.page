import Iota from '../iota/Iota';
import Signature from '../crypto/Signature';
import db from './logDb';

/**
 * Prepares and sends log entries to the tangle for encrypted files
 * @param {string} fileId
 * @param {string} filename
 * @param {boolean} isUpload
 */
export default async function createLog(fileId, filename, isUpload) {
  const iota = new Iota();
  const time = new Date().toUTCString();
  const sig = new Signature();
  const keys = await sig.getKeys();
  const publicHexKey = await sig.exportPublicKey(keys.publicKey);
  await db.log.add({ fileId, filename });
  const logEntry = {
    fileId,
    time,
    isUpload,
    publicHexKey,
  };
  const signature = await sig.sign(keys.privateKey, JSON.stringify(logEntry));
  // https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/38858127
  logEntry.signature = btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
  iota.sendLog(logEntry);
}
