import SigCompression from './SigCompression';
import sigDb from './sigDb';

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
    let cryptoKey;
    let databaseWorks = true;
    try {
      cryptoKey = await sigDb.key.get({ id: 1 });
    } catch (error) {
      databaseWorks = false;
      cryptoKey = undefined;
    }
    if (typeof cryptoKey === 'undefined') {
      cryptoKey = await window.crypto.subtle.generateKey(
        {
          name: this.signatureName,
          namedCurve: this.nameCurve,
        },
        false,
        ['sign', 'verify'],
      );
      if (databaseWorks) {
        await sigDb.key.add(cryptoKey);
      }
    }
    return cryptoKey;
  }

  /**
   * Export public as hex string
   * @param {object} publicKey
   * @returns {string} publickey as hex string
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
   * @param {string} key as hex string
   * @returns {object} public key
   */
  importPublicKey(key) {
    const keydata = SigCompression.ECPointDecompress(key);
    return window.crypto.subtle.importKey(
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
    );
  }

  /**
   *
   * @param {object} privateKey
   * @param {string} text
   */
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
   * @param {string} signatureBase64
   * @param {string} text
   */
  verify(publicKey, signatureBase64, text) {
    const enc = new TextEncoder();
    const sigArray = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    return window.crypto.subtle.verify(
      {
        name: this.signatureName,
        hash: { name: this.nameHash },
      },
      publicKey,
      sigArray,
      enc.encode(text),
    );
  }
}
