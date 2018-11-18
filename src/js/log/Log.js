import Iota from './Iota';
import Signature from './Signature';

const STORAGEKEY = 'logsv0.1';

export default class Log {
  constructor() {
    this.time = new Date().toUTCString();
    this.idNumber = 0;
  }

  /**
   * Creates log entries on IOTA
   * @param {string} fileId
   * @param {string} filename
   * @param {boolean} isUpload
   * @param {string} gateway
   * @param {boolean} isEncrypted
   * @param {string} description
   */
  createLog(fileId, filename, isUpload, gateway, isEncrypted, description) {
    let logs = JSON.parse(window.localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      logs = [];
    } else {
      this.idNumber = logs.length;
    }
    const sig = new Signature();
    const publicKey = sig.generateKeyPairHex();

    // log needs to be different, probably better integrate into indexdb
    logs.push(`${this.idNumber}???${fileId}&&&${filename}===${publicKey}`);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
    const signature = sig.sign(
      this.idNumber + fileId + this.time + gateway + isUpload + isEncrypted,
    );
    // Tag contains information about encryption and upload, no need to integrate this here!
    const minLog = {
      id: this.idNumber,
      fileId,
      time: this.time,
      gateway,
      signature,
    };
    new Iota().send(
      minLog,
      isUpload,
      isEncrypted,
      filename,
      description,
    );
  }
}
