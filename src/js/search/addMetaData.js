export default function addMetaData(fileId, fileName, fileType, description, time, gateway) {
  window.metadata.push({
    fileId,
    fileName,
    fileType,
    description,
    time,
    gateway,
  });
  window.miniSearch.add({
    fileId,
    fileName,
    fileType,
    description,
  });
}
