import { UNAVAILABLE_DESC } from './searchConfig';
import SubscriptionDb from './SubscriptionDb';

/**
 * Stores metadata
 * @param {string} fileId
 * @param {string} fileNameType
 * @param {string} description for Not available metadata == '&Unavailable on Dweb.page&'
 */
export default async function createMetadata(fileId, fileNameType, description, price = 0) {
  const time = new Date().toUTCString();
  const [, fileNamePart, fileTypePart] = fileNameType.match(/(.*)\.(.*)/);

  const metadata = {
    fileId,
    fileName: fileNamePart,
    fileType: fileTypePart,
    description,
    time,
    price,
  };

  if (description !== UNAVAILABLE_DESC) {
    window.metadataDb.put(metadata);
    // FIXME: doesn't update search
    window.miniSearch.add(metadata);
  } else {
    try {
      window.miniSearch.remove({
        fileId: metadata.fileId,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
      });
      // TODO: remove in metadataDB
      new SubscriptionDb().removeSubscription(metadata.address);
    } catch (error) {
      // console.log(error);
    }
  }
}
