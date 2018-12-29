import SigCompression from './SigCompression';
import db from './sigDb';

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

  /**
   * Export public as hex string
   * @param {object} publicKey
   * @return {string} publickey as hex string
   */
  async exportPublicKey(publicKey) {
    const keydata = await window.crypto.subtle.exportKey(
      this.keyFormat,
      publicKey,
    );
    return SigCompression.ECPointCompress(keydata.x, keydata.y);
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

  sign(privateKey, text) {
    const enc = new TextEncoder();
    return window.crypto.subtle.sign(
      {
        name: this.signatureName,
        hash: { name: this.nameHash },
      },
      privateKey,
      enc.encode(text), // ArrayBuffer of data you want to sign
    );
  }

  /**
   *
   * @param {string} publicKey
   * @param {arraybuffer} signature
   * @param {arraybuffer} data
   */
  verify(publicKey, signature, data) {
    return window.crypto.subtle.verify(
      {
        name: this.signatureName,
        hash: { name: this.nameHash },
      },
      publicKey, // from generateKey or importKey above
      signature, // ArrayBuffer of the signature
      data, // ArrayBuffer of the data
    );
  }
}
