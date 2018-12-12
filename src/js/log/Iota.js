import IOTA from 'iota.lib.js';
import createDayNumber from '../helperFunctions/createDayNumber';
import powaas from './powaas';

// todo: random node selection needs to replace by
// something detecting the health of iota nodes
//   'https://node02.iotatoken.nl:443',ERR_SSL_VERSION_INTERFERENCE
const NODES = ['https://pow3.iota.community:443',
  'https://nodes.thetangle.org:443',
  'https://field.deviota.com:443'];

export default class Iota {
  constructor() {
    this.node = NODES[Math.floor(Math.random() * NODES.length)];
    this.iotaNode = new IOTA({ provider: this.node });
    this.tagLength = 27;
    this.depth = 3;
    this.minWeight = 14;
  }

  send(
    metadata,
    id,
    signature,
    isUpload,
    isEncrypted,
  ) {
    if (!this.node.includes('thetangle.org')) {
      powaas(this.iotaNode, 'https://api.powsrv.io:443/');
    }

    const log = {
      id,
      fileId: metadata.fileId,
      time: metadata.time,
      gateway: metadata.gateway,
      signature,
    };
    // timeTag changes every month. If more users change more frequent
    const timeTag = this.createTimeTag(createDayNumber());
    let uploadTag = 'U'; // U = Upload, D = Download
    if (!isUpload) {
      uploadTag = 'D';
    }
    let tag = `DWEBPR${uploadTag}`; // PR = private, PU = Public
    if (!isEncrypted) {
      tag = `DWEBPU${uploadTag + timeTag}`; // unencrypted + DATE
      log.fileName = metadata.fileName;
      log.fileType = metadata.fileType;
      log.description = metadata.description;
    }
    const trytes = this.iotaNode.utils.toTrytes(log.fileId).slice(0, 81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(log));
    const transfers = [
      {
        value: 0,
        address: trytes,
        message: tryteMessage,
        tag: 'DWEBPAGETEST', // tag,
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
