import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { stringToU8a } from '@polkadot/util';
// import { getTypeRegistry } from '@polkadot/types';

// only for testing
const ALICE_SEED = 'Alice'.padEnd(32, ' ');
// const BOB_SEED = 'Bob'.padEnd(32, ' ');

export default class Starlog {
  constructor(userseed = ALICE_SEED) {
    this.provider = new WsProvider('ws://127.0.0.1:9944');
    this.user = new Keyring().addFromSeed(stringToU8a(userseed));
  }

  async connect() {
    console.log('connect...');
    this.api = await ApiPromise.create({
      provider: this.provider,
      types: {
        Metalog: {
          ipfs_hash: 'Vec<u8>',
          time: 'Moment',
          license_code: 'u16',
          price: 'Balance',
          gateway: 'Vec<u8>',
          meta_hash: 'Hash',
        },
      },
    });
    window.starlogapi = this.api;
  }

  /**
   * Store metadata on Starlog
   * @param {String} ipfsHash
   * @param {String} metadata
   * @param {Number} price
   * @param {String} ownerInput
   */
  async storeMeta(ipfsHash, licenseCode, price, gateway, metadata) {
    const transfer = this.api.tx.rtMetadata.storeMeta(ipfsHash, licenseCode, price, gateway, metadata);
    console.log(this.user);
    const hash = await transfer.signAndSend(this.user);
    console.log('Transfer sent with hash', hash.toHex());
  }

  async unavailable(ipfsHash) {
    const transfer = this.api.tx.rtUnavailability.markAsUnavailable(ipfsHash);
    console.log(this.user);
    const hash = await transfer.signAndSend(this.user);
    console.log('Transfer sent with hash', hash.toHex());
  }

  async loadMetadataByUser(nr, accountId = this.user) {
    console.log(this.user);
    const transfer = await this.api.query.metadataStorage.ownedMetaArray(accountId, nr);
    console.log(transfer);
  }

  // TODO: why does this fail?
  async loadMetadatByHash(ipfsHash) {
    console.log(`This is the ipfs hash: ${ipfsHash}`);
    return this.api.query.metadataStorage.hashMeta(ipfsHash);
  }

  async loadRecentMetadata() {
    const mostRecent = await this.api.query.metadataStorage.metadataCount();
  }

  // async transferMoney(receiver, amount) {
  //   // Create a extrinsic, transferring 12345 units to Bob
  //   const transfer = this.api.tx.balances.transfer(OPEN_LICENCE_ADDR, amount);
  //   const hash = await transfer.signAndSend(this.user);

  //   console.log('Transfer sent with hash', hash.toHex());
  // }
}
