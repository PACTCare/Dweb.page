import IOTA from 'iota.lib.js';
// import poWaaS from './powaas';

const NODE = 'https://nodes.thetangle.org:443';

export default class Iota {
  constructor() {
    this.iotaNode = new IOTA({ provider: NODE });
  }

  send(
    idNumber,
    fileId,
    time,
    isUpload,
    gateway,
    isEncrypted,
    signature,
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
    const trytes = this.iotaNode.utils.toTrytes(fileId).slice(0, 81);
    const tryteMessage = this.iotaNode.utils.toTrytes(JSON.stringify(params));
    const tag = 'PACTDOTONLINE';
    const transfers = [
      {
        value: 0,
        address: trytes,
        message: tryteMessage,
        tag,
      },
    ];
    return new Promise((resolve, reject) => {
      this.iotaNode.api.sendTransfer(trytes, 3, 14, transfers, (err, res) => {
        if (!err) {
          return resolve(res);
        }
        return reject(err);
      });
    });
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

  getLog(transaction) {
    return new Promise((resolve, reject) => {
      this.iotaNode.api.getBundle(transaction, (error, sucess2) => {
        if (error) {
          reject(error);
        } else {
          let message = sucess2[0].signatureMessageFragment;
          message = message.split(
            '99999999999999999999999999999999999999999999999999',
          )[0];
          const obj = JSON.parse(this.iotaNode.utils.fromTrytes(message));
          resolve(obj);
        }
      });
    });
  }
}
