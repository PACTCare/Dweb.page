/**
 * Prepares metadata for Starlog and search
 * @param {object} metaData
 */
export default function prepMetaData(metaData) {
  const changedMeta = metaData;
  changedMeta.fileName = changedMeta.fileName.replace(new RegExp('_', 'g'), ' ');
  changedMeta.fileName = changedMeta.fileName.substring(0, 80);
  changedMeta.fileType = changedMeta.fileType.substring(0, 15);
  changedMeta.description = changedMeta.description.substring(0, 400);
  // TODO: under 500 bytes!
  const test = new TextEncoder('utf-8').encode(JSON.stringify(changedMeta));
  console.log(`Metadata consists of ${test.length} bytes`);
  return changedMeta;
}
