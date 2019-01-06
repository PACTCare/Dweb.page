import Iota from '../iota/Iota';
import addMetaData from './addMetaData';
import prepMetaData from './prepMetaData';
import Signature from '../crypto/Signature';
import lobDb from '../log/logDb';

/**
 * Prepares and sends metadata to the tangle for public files
 * @param {string} fileId
 * @param {string} fileNameType
 * @param {string} gateway
 * @param {string} description for Not available metadata == '&Unavailable on Dweb.page&'
 */
export default async function createMetadata(fileId, fileNameType, gateway, description) {
  const iota = new Iota();
  await iota.nodeInitialization();
  const time = new Date().toUTCString();
  const sig = new Signature();
  const keys = await sig.getKeys();
  const publicHexKey = await sig.exportPublicKey(keys.publicKey);
  const publicTryteKey = iota.hexKeyToTryte(publicHexKey);
  const [, fileNamePart, fileTypePart] = fileNameType.match(/(.*)\.(.*)/);
  try {
    await lobDb.log.add({
      fileId, filename: fileNameType, time, isUpload: true, isPrivate: false, folder: 'none',
    });
  } catch (error) {
    console.log(error);
  }
  let metadata = {
    fileId,
    fileName: fileNamePart,
    fileType: fileTypePart,
    description,
    time,
    gateway,
    publicTryteKey,
  };
  metadata = prepMetaData(metadata);
  const signature = await sig.sign(keys.privateKey, JSON.stringify(metadata));
  metadata.signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  iota.sendMetadata(metadata);
  // store direct in database!
  addMetaData(metadata);
}
