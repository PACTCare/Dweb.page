/* eslint-disable class-methods-use-this */
import Trytes from 'trytes';
import createDayNumber from '../search/createDayNumber';
import getHealthyNode from './getHealthyNode';
import {
  TAG_VERSION_NR,
  TAG_PREFIX_PRIVATE_DOWNLOAD,
  TAG_PREFIX_PRIVATE_UPLOAD,
  TAG_PREFIX_UNAVAILABLE,
} from '../search/searchConfig';
import Error from '../error';


/**
 * Class contains all IOTA related functions
 * nodeInitialization is always needed!
 */
export default class Iota {
  constructor() {
    this.tagLength = 27;
    this.depth = 3;
    this.minWeight = 14;
    this.encoding = 'utf8';
    this.tagPre = 'DWEBV';
  }

  async nodeInitialization() {
    this.iotaNode = await getHealthyNode();
  }

  createTimeTag(dayNumber) {
    return `${this.tagPre + TAG_VERSION_NR}T${Trytes.encodeTextAsTryteString(dayNumber.toString())}`;
  }

  send(tryteAddress, tryteMessage, tag) {
    const transfers = [
      {
        value: 0,
        address: tryteAddress,
        message: tryteMessage,
        tag,
      },
    ];
    return new Promise((resolve, reject) => {
      this.iotaNode.api.sendTransfer(tryteAddress,
        this.depth,
        this.minWeight,
        transfers, (err, res) => {
          if (!err) {
            return resolve(res);
          }
          return reject(err);
        });
    });
  }

  /**
   * Creates entry on tangle: unencrypted files need metadata,
   * encrypted files are found by file hash
   * @param {object} metadata
   * @param {boolean} unavailableData
   */
  sendMetadata(metadata, unavailableData = false) {
    const iotaJson = metadata;
    let tag = this.createTimeTag(createDayNumber());
    if (unavailableData) {
      tag = TAG_PREFIX_UNAVAILABLE + tag;
    }
    const tryteAddress = metadata.publicTryteKey.slice(0, 81);
    iotaJson.publicTryteKey = metadata.publicTryteKey.slice(81);
    const tryteMessage = Trytes.encodeTextAsTryteString(JSON.stringify(iotaJson));
    this.send(tryteAddress, tryteMessage, tag); // add tag
  }

  /**
   * Creates a log object
   * @param {object} logEntry
   * @param {boolean} isUpload
   */
  sendLog(logEntry, isUpload) {
    const tryteAddress = Trytes.encodeTextAsTryteString(logEntry.fileId).slice(0, 81);
    const tryteMessage = Trytes.encodeTextAsTryteString(JSON.stringify(logEntry));
    let tag = TAG_PREFIX_PRIVATE_DOWNLOAD + this.createTimeTag(createDayNumber());
    if (isUpload) {
      tag = TAG_PREFIX_PRIVATE_UPLOAD + this.createTimeTag(createDayNumber());
    }
    this.send(tryteAddress, tryteMessage, tag);
  }

  /**
   * Generates 86 character long tryte public key for secp256r1
   * @param {string} hexKey
   */
  hexKeyToTryte(hexKey) {
    const trytePublicKey = Trytes.encodeTextAsTryteString(Buffer.from(hexKey, 'hex').toString('base64'));
    // starts always with KB => remove KB
    return trytePublicKey.substr(2);
  }

  /**
   * Transforms a tryte public key to a hex public key for secp256r1
   * @param {string} tryteKey
   */
  tryteKeyToHex(tryteKey) {
    return Buffer.from(Trytes.decodeTextFromTryteString(`KB${tryteKey}`), 'base64').toString('hex');
  }

  /**
   * Converts an IPFS hash into an IOTA address
   * @param {string} hash
   */
  convertHashToAddress(hash) {
    return Trytes.encodeTextAsTryteString(hash).substring(0, 81);
  }

  getTransaction(searchVarsAddress) {
    return new Promise((resolve, reject) => {
      this.iotaNode.api.findTransactions(searchVarsAddress, (error, transactions) => {
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
    return this.getTransaction(searchVarsAddress);
  }

  /**
  * Get Transactions by hash
  * @param {string} hash
  */
  getTransactionByHash(hash) {
    const loggingAddress = this.convertHashToAddress(hash);
    const searchVarsAddress = {
      addresses: [loggingAddress],
    };
    return this.getTransaction(searchVarsAddress);
  }

  /**
  * Get transactions by public hey key
  * @param {string} publicHexKey
  */
  getTransactionByPublicKey(publicHexKey) {
    const base64 = Buffer.from(publicHexKey, 'hex').toString('base64');
    const kbAddress = Trytes.encodeTextAsTryteString(base64).substring(0, 83);
    const address = kbAddress.substr(2);
    const searchVarsAddress = {
      addresses: [address],
    };
    return this.getTransaction(searchVarsAddress);
  }

  /**
  * Get transaction by address
  * @param {string} tryte Address
  * @param {string} tag
  */
  getTransactionByAddressAndTag(address, tag) {
    const searchVarsAddress = {
      addresses: [address],
      tags: [tag],
    };
    return this.getTransaction(searchVarsAddress);
  }

  /**
   * Returns the message of an Iota transaction
   * @param {string} transaction
   */
  getMessage(transaction) {
    return new Promise((resolve, reject) => {
      this.iotaNode.api.getBundle(transaction, (error, sucess2) => {
        if (error) {
          reject(error);
        } else {
          const message = sucess2[0].signatureMessageFragment;
          const [usedMessage] = message.split(
            '9999999999999999999999999999999999999',
          );
          let obj;
          if (usedMessage.length > 1) {
            try {
              obj = JSON.parse(Trytes.decodeTextFromTryteString(usedMessage));
              obj.tag = sucess2[0].tag;
              obj.address = sucess2[0].address;
            } catch (er) {
              console.error(Error.IOTA_INVALID_JSON);
            }
          }

          resolve(obj);
        }
      });
    });
  }
}
