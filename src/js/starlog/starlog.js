import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { stringToU8a, u8aToHex } from '@polkadot/util';

// only for testing
const ALICE_SEED = 'Alice'.padEnd(32, ' ');
const BOB_ADDR = '5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE';

export default class Starlog {
  constructor(userseed = ALICE_SEED) {
    this.provider = new WsProvider('ws://127.0.0.1:9944');
    this.user = new Keyring().addFromSeed(stringToU8a(userseed));
  }

  async connect() {
    console.log('connect...');
    this.api = await ApiPromise.create(this.provider);

    // for testing/debugging
    window.starlog = this.api;
  }

  async storeMeta(ipfsHash, metadata, price) {
    const ipfsHashHex = u8aToHex(stringToU8a(ipfsHash));
    const metadataHex = u8aToHex(stringToU8a(metadata));
    const transfer = this.api.tx.starlog.storeMeta(ipfsHashHex, metadataHex, price);

    const hash = await transfer.signAndSend(this.user);
    console.log('Transfer sent with hash', hash.toHex());
  }

  async transferMoney(receiver, amount) {
    // Create a extrinsic, transferring 12345 units to Bob
    const transfer = this.api.tx.balances.transfer(BOB_ADDR, amount);
    const hash = await transfer.signAndSend(this.user);

    console.log('Transfer sent with hash', hash.toHex());
  }
}
