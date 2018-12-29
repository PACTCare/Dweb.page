import SigCompression from './SigCompression';
import db from './SigDatabase';

/**
 * Curves and their primes
 * NIST P-256 (secp256r1) 2^256 - 2^224 + 2^192 + 2^96 - 1
 */
export default class Signature {
  constructor() {
    this.signatureName = 'ECDSA';
    this.nameCurve = 'P-256'; // secp256r1
    this.nameHash = 'SHA-256';
    this.keyFormat = 'jwk'; // jwk, spki => 86 characters base 64
  }

  /**
   * Loads public & private key from database or generates new key
   */
  async getKeys() {
    let cryptoKey = await db.key.get({ id: 1 });
    if (typeof cryptoKey === 'undefined') {
      cryptoKey = await window.crypto.subtle.generateKey(
        {
          name: this.signatureName,
          namedCurve: this.nameCurve,
        },
        false,
        ['sign', 'verify'],
      );
      await db.key.add(cryptoKey);
    }
    return cryptoKey;
  }

  async exportPublicKey(key) {
    // generate new keys or load database
    // maybe in constructor
    const keydata = await window.crypto.subtle.exportKey(
      this.keyFormat,
      key,
    );
    const test = SigCompression.ECPointCompress(keydata.x, keydata.y);
    // const iota = new IOTA();
    // // https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript
    // const tryteTest = iota.trytesGenerater(Buffer.from(test, 'hex').toString('base64'));
    // console.log(tryteTest);
    // starts always with kb
    // KB can be removed
    // result 88 bzw. 86 -> 5 letters
    // sig.importPublicKey('x', 'y');
    return test;
  }

  /**
   * Import public compressed key
   * @param {string} key
   */
  importPublicKey(key) {
    const keydata = SigCompression.ECPointDecompress(key);
    console.log('keydata');
    console.log(keydata);
    window.crypto.subtle.importKey(
      this.keyFormat,
      { // this is an example jwk key, other key types are Uint8Array objects
        kty: 'EC',
        crv: this.nameCurve,
        x: keydata.x,
        y: keydata.y,
        ext: true,
      },
      {
        name: this.signatureName,
        namedCurve: this.nameCurve,
      },
      false, // whether the key is extractable (i.e. can be used in exportKey)
      ['verify'],
    )
      .then((publicKey) => {
        // returns a publicKey (or privateKey if you are importing a private key)
        console.log('Success');
        console.log(publicKey);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  sign(privateKey, data) {
    window.crypto.subtle.sign(
      {
        name: this.signatureName,
        hash: { name: this.nameHash },
      },
      privateKey,
      data, // ArrayBuffer of data you want to sign
    )
      .then((signature) => {
        // returns an ArrayBuffer containing the signature
        console.log(new Uint8Array(signature));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   *
   * @param {string} publicKey
   * @param {arraybuffer} signature
   * @param {arraybuffer} data
   */
  verify(publicKey, signature, data) {
    window.crypto.subtle.verify(
      {
        name: this.signatureName,
        hash: { name: this.nameHash },
      },
      publicKey, // from generateKey or importKey above
      signature, // ArrayBuffer of the signature
      data, // ArrayBuffer of the data
    )
      .then((isvalid) => {
        // returns a boolean on whether the signature is true or not
        console.log(isvalid);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
