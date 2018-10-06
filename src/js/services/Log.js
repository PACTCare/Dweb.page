"use strict";

import { Iota } from "./Iota";
import { Signature } from "./Signature";

const STORAGEKEY = "logsv0.1";

export class Log {
  constructor() {}

  Pinger_ping(ip, callback) {
    if (!this.inUse) {
      this.inUse = true;
      this.callback = callback;
      this.ip = ip;
      var _that = this;
      this.img = new Image();
      this.img.onload = function() {
        _that.good();
      };
      this.img.onerror = function() {
        _that.good();
      };
      this.start = new Date().getTime();
      this.img.src = "http://" + ip;
      this.timer = setTimeout(function() {
        _that.bad();
      }, 1500);
    }
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
    const time = new Date().toUTCString();
    let idNumber = 0;
    var logs = JSON.parse(window.localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      logs = [];
    } else {
      idNumber = logs.length;
    }
    const sig = new Signature();
    const publicKey = sig.generateKeyPairHex();

    // log needs to be different
    logs.push(idNumber + "???" + fileId + "&&&" + filename + "===" + publicKey);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
    const signature = sig.sign(
      idNumber + fileId + time + gateway + isUpload + isEncrypted
    );
    const pageSignature = sig.pageSign(
      idNumber + fileId + time + gateway + isUpload + isEncrypted
    );
    new Iota().send(
      idNumber,
      fileId,
      time,
      isUpload,
      gateway,
      isEncrypted,
      signature,
      pageSignature
    );
  }
}
