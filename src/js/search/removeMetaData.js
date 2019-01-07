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
  } catch (error) {
    // console.log(error);
  }
}
