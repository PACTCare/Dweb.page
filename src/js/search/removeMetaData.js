/**
 * Removes the metadata object from the search engine
 * @param {object} metadata
 */
export default function removeMetaData(metadata) {
  console.log('remove started');
  window.miniSearch.remove({
    fileId: metadata.fileId,
    fileName: metadata.fileName,
    fileType: metadata.fileType,
  });
}
