import logDb from './logDb';
import Error from '../error';
import Starlog from '../starlog/starlog';

// TODO: update
/**
 * Prepares and sends log entries to Starlog as well as logDB
 * @param {string} fileId
 * @param {string} filename
 * @param {boolean} isUpload
 */
export default async function createLog(fileId, filename, isUpload) {
  const time = new Date().toUTCString();
  try {
    await logDb.log.add({
      fileId, filename, time, isUpload, isPrivate: true, folder: 'none',
    });
  } catch (error) {
    console.error(Error.ADD_DATABASE_ENTRY);
  }
  const logEntry = {
    fileId,
    time,
    isUpload,
  };

  const starlog = new Starlog();
  await starlog.connect();
  await starlog.storeMeta(fileId, JSON.stringify(logEntry), 0);
}
