/**
 * Prepares metadata for IOTA and search
 * @param {object} metaData
 */
export default function prepMetaData(metaData) {
  const changedMeta = metaData;
  changedMeta.fileName = changedMeta.fileName.replace(new RegExp('_', 'g'), ' ');
  changedMeta.fileName = changedMeta.fileName.substring(0, 100);
  changedMeta.fileType = changedMeta.fileType.substring(0, 15);
  changedMeta.description = changedMeta.description.substring(0, 500);
  return changedMeta;
}
