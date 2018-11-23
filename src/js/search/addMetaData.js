/**
 * Adds the metadata object to the search engine
 * @param {object} metadata
 */
export default function addMetaData(metadata) {
  window.metadata.push(metadata);
  window.miniSearch.add({
    fileId: metadata.fileId,
    fileName: metadata.fileName,
    fileType: metadata.fileType,
    description: metadata.description,
  });
}
