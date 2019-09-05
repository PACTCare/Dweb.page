import addMetaData from './addMetadata';
import prepMetaData from './prepMetaData';
import Signature from '../crypto/Signature';
import MetadataDb from './MetadataDb';
import { UNAVAILABLE_DESC } from './searchConfig';
import removeMetaData from './removeMetaData';

// TODO: integrate orbitdb
/**
 * Prepares and sends metadata to the tangle for public files
 * @param {string} fileId
 * @param {string} fileNameType
 * @param {string} description for Not available metadata == '&Unavailable on Dweb.page&'
 */
export default async function createMetadata(fileId, fileNameType, description) {
  const time = new Date().toUTCString();
  const sig = new Signature();
  const keys = await sig.getKeys();
  const publicHexKey = await sig.exportPublicKey(keys.publicKey);
  const [, fileNamePart, fileTypePart] = fileNameType.match(/(.*)\.(.*)/);
  // Unavailable metadata doesn't need to be stored in logDb

  const metadata = {
    fileId,
    fileName: fileNamePart,
    fileType: fileTypePart,
    description,
    time,
  };
  const signature = await sig.sign(keys.privateKey, JSON.stringify(metadata));
  metadata.signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  // store available data directly in database!
  if (description !== UNAVAILABLE_DESC) {
    addMetaData(metadata);
  } else {
    removeMetaData(metadata);
    try {
      await new MetadataDb().noLongerAvailable(metadata);
    } catch (error) {
      console.log(error);
    }
  }
}
