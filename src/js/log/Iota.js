import IOTA from 'iota.lib.js';
import createDayNumber from '../helperFunctions/createDayNumber';
// import poWaaS from './powaas';

const NODE = 'https://nodes.thetangle.org:443';

export default class Iota {
  constructor() {
    this.iotaNode = new IOTA({ provider: NODE });
    this.tagLength = 27;
    this.depth = 3;
    this.minWeight = 14;
  }

  send(
    minLog,
    isUpload,
    isEncrypted,
    filename,
    description,
  ) {
    // not needed since the tangle as poWaas integrated!
    // poWaaS(this.iotaNode, 'https://api.powsrv.io:443/');

    const maxLog = minLog;
    // timeTag changes every month. If more users change more frequent
    const timeTag = this.createTimeTag(createDayNumber());
    const [fileNamePart, fileTypePart] = filename.split('.');
    let uploadTag = 'U'; // U = Upload, D = Download
    if (!isUpload) {
      uploadTag = 'D';
    }
    let tag = `DWEBPR${uploadTag}`; // PR = private, PU = Public
    if (!isEncrypted) {
      tag = `DWEBPU${uploadTag + timeTag}`; // unencrypted + DATE
      maxLog.fileName = fileNamePart.substring(0, 100);
      maxLog.fileType = fileTypePart.substring(0, 15);
      maxLog.description = description.substring(0, 500);
    }
    const trytes = this.iotaNode.utils.toTrytes(minLog.fileId).slice(0, 81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(minLog));
    const transfers = [
      {
        value: 0,
        address: trytes,
        message: tryteMessage,
        tag,
      },
    ];
    return new Promise((resolve, reject) => {
      this.iotaNode.api.sendTransfer(trytes, this.depth, this.minWeight, transfers, (err, res) => {
        if (!err) {
          return resolve(res);
        }
        return reject(err);
      });
    });
  }

  createTimeTag(number) {
    return this.iotaNode.utils.toTrytes(number.toString());
  }

  /**
   *
   * @param {string} filename
   */
  filenameToTag(filename) {
    const filenameWithoutExtension = filename.split('.')[0].toUpperCase();
    const tryteFilenname = this.iotaNode.utils.toTrytes(filenameWithoutExtension);
    const tag = tryteFilenname.substring(0, this.tagLength);
    return tag;
  }

  /**
   *
   * @param {string} hash
   */
  getTransaction(hash) {
    const loggingAddress = this.iotaNode.utils.toTrytes(hash).substring(0, 81);
    const searchVarsAddress = {
      addresses: [loggingAddress],
    };
    return new Promise((resolve, reject) => {
      this.iotaNode.api.findTransactions(searchVarsAddress, (
        error,
        transactions,
      ) => {
        if (error) {
          reject(error);
        } else {
          resolve(transactions);
        }
      });
    });
  }

  /**
   * Gets transactions on IOTA by name
   * @param {string} filename
   */
  getTransactionByTag(tag) {
    const searchVarsAddress = {
      tags: [tag], // 'BILDPNG99999999999999999999'
    };
    return new Promise((resolve, reject) => {
      this.iotaNode.api.findTransactions(searchVarsAddress, (
        error,
        transactions,
      ) => {
        if (error) {
          reject(error);
        } else {
          resolve(transactions);
        }
      });
    });
  }

  /**
   *
   * @param {string} transaction
   */
  getLog(transaction) {
    return new Promise((resolve, reject) => {
      this.iotaNode.api.getBundle(transaction, (error, sucess2) => {
        if (error) {
          reject(error);
        } else {
          const message = sucess2[0].signatureMessageFragment;
          const [usedMessage] = message.split(
            '99999999999999999999999999999999999999999999999999',
          );
          const obj = JSON.parse(this.iotaNode.utils.fromTrytes(usedMessage));
          obj.tag = sucess2[0].tag;
          resolve(obj);
        }
      });
    });
  }

  /**
   *
   * @param {string} transaction
   */
  getAddress(transaction) {
    return new Promise((resolve, reject) => {
      this.iotaNode.api.getBundle(transaction, (error, sucess2) => {
        if (error) {
          reject(error);
        } else {
          const message = sucess2[0].signatureMessageFragment;
          const [usedMessage] = message.split(
            '99999999999999999999999999999999999999999999999999',
          );
          const obj = JSON.parse(this.iotaNode.utils.fromTrytes(usedMessage));
          resolve(obj);
        }
      });
    });
  }
}
