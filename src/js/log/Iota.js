import IOTA from 'iota.lib.js';
// import poWaaS from './powaas';

const NODE = 'https://nodes.thetangle.org:443';

export default class Iota {
  constructor() {
    this.iotaNode = new IOTA({ provider: NODE });
    this.tagLength = 27;
    this.depth = 3;
    this.minWeight = 14;
  }

  /**
   *
   * @param {number} idNumber
   * @param {string} fileId
   * @param {string} time
   * @param {boolean} isUpload
   * @param {string} gateway
   * @param {boolean} isEncrypted
   * @param {string} signature
   */
  send(
    idNumber,
    fileId,
    time,
    isUpload,
    gateway,
    isEncrypted,
    signature,
    filename,
  ) {
    const params = {
      id: idNumber,
      fileId,
      time,
      gateway,
      upload: isUpload,
      encrypted: isEncrypted,
      signature,
    };

    // not needed since the tangle as poWaas integrated!
    // poWaaS(this.iotaNode, 'https://api.powsrv.io:443/');

    let tag = 'PACTDOTONLINE';
    if (!isEncrypted) {
      tag = this.filenameToTag(filename);
      params.fullFileName = filename;
    }
    const trytes = this.iotaNode.utils.toTrytes(fileId).slice(0, 81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(params));
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
   *
   * @param {string} filename
   */
  getTransactionByName(filename) {
    const tag = this.filenameToTag(filename);
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
