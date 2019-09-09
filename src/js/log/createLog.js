
// TODO: store on orbitd
/**
 * Prepares and sends log entries to the tangle for encrypted files
 * @param {string} fileId
 * @param {string} filename
 * @param {boolean} isUpload
 */
export default async function createLog(fileId, filename, isUpload) {
  const time = new Date().toUTCString();


  const logEntry = {
    fileId,
    time,
    isUpload,
  };
}
