import SubscriptionDb from './SubscriptionDb';
import MetadataDb from './MetadataDb';

/**
 * Removes the metadata object from the search engine
 * @param {object} metadata
 */
export default function removeMetaData(metadata) {
  try {
    window.miniSearch.remove({
      fileId: metadata.fileId,
      fileName: metadata.fileName,
      fileType: metadata.fileType,
    });
    new MetadataDb().removeMetaData(metadata.address);
    new SubscriptionDb().removeSubscription(metadata.address);
  } catch (error) {
    // console.log(error);
  }
}
