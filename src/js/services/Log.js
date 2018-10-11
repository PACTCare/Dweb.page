import Iota from './Iota';
import Signature from './Signature';

const STORAGEKEY = 'logsv0.1';

export default class Log {
  constructor() { }

  /**
   *
   * @param {string} fileId
   * @param {string} filename
   * @param {boolean} isUpload
   * @param {string} gateway
   * @param {boolean} isEncrypted
   */
  createLog(fileId, filename, isUpload, gateway, isEncrypted) {
    const time = new Date().toUTCString();
    let idNumber = 0;
    let logs = JSON.parse(window.localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      logs = [];
    } else {
      idNumber = logs.length;
    }
    const sig = new Signature();
    const publicKey = sig.generateKeyPairHex();

    // log needs to be different
    logs.push(`${idNumber}???${fileId}&&&${filename}===${publicKey}`);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
    const signature = sig.sign(
      idNumber + fileId + time + gateway + isUpload + isEncrypted,
    );
    const pageSignature = sig.pageSign(
      idNumber + fileId + time + gateway + isUpload + isEncrypted,
    );
    new Iota().send(
      idNumber,
      fileId,
      time,
      isUpload,
      gateway,
      isEncrypted,
      signature,
      pageSignature,
    );
  }
}
