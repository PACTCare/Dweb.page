import IOTA from './Iota';
import SigCompression from './SigCompression';

/**
 * Curves and their primes
 * NIST P-256 (secp256r1) 2^256 - 2^224 + 2^192 + 2^96 - 1
 */
export default class Signature {
  constructor() {
    this.signatureName = 'ECDSA';
    this.nameCurve = 'P-256'; // secp256r1
    this.keyFormat = 'jwk'; // jwk, spki => 86 characters base 64
  }

  generateKeys() {
    return window.crypto.subtle.generateKey(
      {
        name: this.signatureName,
        namedCurve: this.nameCurve,
      },
      false,
      ['sign', 'verify'],
    );
  }

  async exportKey(key) {
    const keydata = await window.crypto.subtle.exportKey(
      this.keyFormat,
      key,
    );

    // returns the exported key data
    console.log(keydata);
    const test = SigCompression.ECPointCompress(keydata.x, keydata.y);
    const iota = new IOTA();
    // https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript
    const tryteTest = iota.trytesGenerater(Buffer.from(test, 'hex').toString('base64'));
    console.log(tryteTest);
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
}
