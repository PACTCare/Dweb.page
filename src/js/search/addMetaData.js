/**
 * Adds the metadata object to the search engine and the window object
 * @param {object} metadata
 */
export default function addMetadata(metadata) {
  // window metadata also includes the gateway!
  window.metadata.push(metadata);
  window.miniSearch.add({
    fileId: metadata.fileId,
    fileName: metadata.fileName,
    fileType: metadata.fileType,
    description: metadata.description,
  });
}
