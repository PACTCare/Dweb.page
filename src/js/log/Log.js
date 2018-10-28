import Iota from './Iota';
import Signature from './Signature';

const STORAGEKEY = 'logsv0.1';

export default class Log {
  constructor() {
    this.time = new Date().toUTCString();
    this.idNumber = 0;
  }

  /**
   *
   * @param {string} fileId
   * @param {string} filename
   * @param {boolean} isUpload
   * @param {string} gateway
   * @param {boolean} isEncrypted
   */
  createLog(fileId, filename, isUpload, gateway, isEncrypted) {
    let logs = JSON.parse(window.localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      logs = [];
    } else {
      this.idNumber = logs.length;
    }
    const sig = new Signature();
    const publicKey = sig.generateKeyPairHex();

    // log needs to be different
    logs.push(`${this.idNumber}???${fileId}&&&${filename}===${publicKey}`);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
    const signature = sig.sign(
      this.idNumber + fileId + this.time + gateway + isUpload + isEncrypted,
    );
    new Iota().send(
      this.idNumber,
      fileId,
      this.time,
      isUpload,
      gateway,
      isEncrypted,
      signature,
      filename,
    );
  }
}
