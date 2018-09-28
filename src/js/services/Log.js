"use strict";

import { Iota } from "./Iota";
import { Signature } from "./Signature";
const STORAGEKEY = "logs";

export class Log {
  constructor() {}
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
    let publicKey = sig.generateKeyPairHex();
    logs.push(idNumber + "???" + fileId + "&&&" + filename + "===" + publicKey);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
    let signature = sig.sign(
      idNumber + fileId + time + gateway + isUpload + isEncrypted
    );
    new Iota().send(
      idNumber,
      fileId,
      time,
      isUpload,
      gateway,
      isEncrypted,
      signature
    );
  }
}
