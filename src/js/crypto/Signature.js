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
      console.log(error);
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
        console.log('error');
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
  async importPublicKey(key) {
    let keydata;
    try {
      keydata = SigCompression.ECPointDecompress(key);
    } catch (error) {
      console.log(error);
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
