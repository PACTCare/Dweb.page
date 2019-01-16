import SigCompression from './SigCompression';
import sigDb from './sigDb';
import Error from '../error';


/**
 * Curves and their primes
 * NIST P-256 (secp256r1) 2^256 - 2^224 + 2^192 + 2^96 - 1
 */
export default class Signature {
  constructor() {
    this.signatureName = 'ECDSA';
    this.nameCurve = 'P-256'; // secp256r1
    this.nameHash = 'SHA-256';
    this.keyFormat = 'jwk';
    this.extractable = false;
  }

  /**
   * Loads public & private key from database or generates new key
   */
  async getKeys() {
    let cryptoKey;
    try {
      cryptoKey = await sigDb.key.get({ id: 1 });
    } catch (error) {
      console.error(Error.NO_DATABASE_ENTRY);
      cryptoKey = undefined;
    }
    if (typeof cryptoKey === 'undefined') {
      cryptoKey = await window.crypto.subtle.generateKey(
        {
          name: this.signatureName,
          namedCurve: this.nameCurve,
        },
        this.extractable,
        ['sign', 'verify'],
      );
      // TODO:
      // Although it’s part of the web crypto api. It’s currently not supported by Firefox and Edge
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1048931
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12782255/
      try {
        await sigDb.key.add(cryptoKey);
      } catch (error) {
        console.log(Error.KEY_CANT_BE_STORED);
      }
    }
    return cryptoKey;
  }

  /**
   * Export public as hex string
   * @param {Object} publicKey
   * @returns {String} publickey as hex string
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
   * @param {String} key as hex string
   * @returns {Object} public key
   */
  async importPublicKey(key) {
    let keydata;
    try {
      keydata = SigCompression.ECPointDecompress(key);
    } catch (error) {
      console.log('Wrong key');
      return undefined;
    }
    return window.crypto.subtle.importKey(
      this.keyFormat,
      {
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
      this.extractable, // extractable
      ['verify'],
    );
  }

  /**
   * Signs text and returns signature
   * @param {Object} privateKey
   * @param {String} Text
   * @returns {String} Promise of signature
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
   * Verifies the text
   * @param {String} publicKey
   * @param {String} signatureBase64
   * @param {String} text
   * @returns {Boolean} Correctly signed
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
