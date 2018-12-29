import IOTA from 'iota.lib.js';
import createDayNumber from '../helperFunctions/createDayNumber';
import powaas from './powaas';

// todo: random node selection needs to replace by
// something detecting the health of iota nodes
const NODES = ['https://pow3.iota.community:443',
  'https://nodes.thetangle.org:443'];

export default class Iota {
  constructor() {
    this.node = NODES[Math.floor(Math.random() * NODES.length)];
    this.iotaNode = new IOTA({ provider: this.node });
    this.tagLength = 27;
    this.depth = 3;
    this.minWeight = 14;
  }

  createTimeTag(number) {
    return this.iotaNode.utils.toTrytes(number.toString());
  }

  send(tryteAddress, tryteMessage, tag = 'DWEBPAGETESTE') {
    const transfers = [
      {
        value: 0,
        address: tryteAddress,
        message: tryteMessage,
        tag,
      },
    ];
    return new Promise((resolve, reject) => {
      this.iotaNode.api.sendTransfer(tryteAddress, this.depth, this.minWeight, transfers, (err, res) => {
        if (!err) {
          return resolve(res);
        }
        return reject(err);
      });
    });
  }

  /**
   * Creates entry on tangle: unencrypted files need metadata, encrypted files are found by file hash
   * @param {object} metadata
   */
  sendMetadata(metadata) {
    if (!this.node.includes('thetangle.org')) {
      powaas(this.iotaNode, 'https://api.powsrv.io:443/');
    }
    const iotaJson = metadata;
    const tag = `DWEB${this.createTimeTag(createDayNumber())}`;
    const tryteAddress = metadata.publicTryteKey.slice(0, 81);
    iotaJson.publicTryteKey = metadata.publicTryteKey.slice(81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(iotaJson));
    this.send(tryteAddress, tryteMessage); // add tag
  }

  sendLog(logEntry) {
    const tryteAddress = this.iotaNode.utils.toTrytes(logEntry.fileId).slice(0, 81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(logEntry));
    this.send(tryteAddress, tryteMessage);
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
   * Generates 86 character long tryte public key for secp256r1
   * https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript
   * @param {string} hexString
   */
  publicKeyPrep(hexString) {
    const trytePublicKey = this.iotaNode.utils.toTrytes(Buffer.from(hexString, 'hex').toString('base64'));
    // starts always with KB => remove KB
    return trytePublicKey.substr(2);
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
