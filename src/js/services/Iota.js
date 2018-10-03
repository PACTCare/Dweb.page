"use strict";

import poWaaS from "./powaas";
import IOTA from "iota.lib.js";

const NODE = "https://nodes.thetangle.org:443";
let iotaNode;

export class Iota {
  constructor() {
    iotaNode = new IOTA({ provider: NODE });
  }

  send(
    idNumber,
    fileId,
    time,
    isUpload,
    gateway,
    isEncrypted,
    signature,
    pageSignature
  ) {
    const params = {
      id: idNumber,
      fileId: fileId,
      time: time,
      gateway: gateway,
      upload: isUpload,
      encrypted: isEncrypted,
      signature: signature,
      pageSignature: pageSignature
    };
    //CORS not suported by powsrv https://stackoverflow.com/questions/49872111/detect-safari-and-stop-script
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) {
      poWaaS(iotaNode, "https://api.powsrv.io:443/");
    }
    const trytes = iotaNode.utils.toTrytes(fileId).slice(0, 81);
    console.log("Address: " + trytes);
    const tryteMessage = iotaNode.utils.toTrytes(JSON.stringify(params));
    const transfers = [
      {
        value: 0,
        address: trytes,
        message: tryteMessage,
        tag: "PACTDOTONLINE"
      }
    ];
    return new Promise((resolve, reject) => {
      iotaNode.api.sendTransfer(trytes, 3, 14, transfers, (err, res) => {
        if (!err) {
          return resolve(res);
        }
        console.log(`Send error: ${err}`);
        return reject(err);
      });
    });
  }

  /**
   *
   * @param {string} hash
   */
  getTransaction(hash) {
    const loggingAddress = iotaNode.utils.toTrytes(hash).substring(0, 81);
    var searchVarsAddress = {
      addresses: [loggingAddress]
    };
    return new Promise((resolve, reject) => {
      iotaNode.api.findTransactions(searchVarsAddress, function(
        error,
        transactions
      ) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          {
            resolve(transactions);
          }
        }
      });
    });
  }

  getLog(transaction) {
    return new Promise((resolve, reject) => {
      iotaNode.api.getBundle(transaction, function(error, sucess2) {
        if (error) {
          reject("error");
        } else {
          var message = sucess2[0].signatureMessageFragment;
          message = message.split(
            "99999999999999999999999999999999999999999999999999"
          )[0];
          var obj = JSON.parse(iotaNode.utils.fromTrytes(message));
          resolve(obj);
        }
      });
    });
  }
}
