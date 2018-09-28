"use strict";

const ENCRYPTIONNAME = "AES-GCM";
const TAGLENGTH = 128;

export class Encryption {
  constructor() {}
  generateKey() {
    return window.crypto.subtle.generateKey(
      {
        name: ENCRYPTIONNAME,
        length: 256
      },
      true, //whether the key is extractable
      ["encrypt", "decrypt"]
    );
  }
  exportKey(key) {
    return window.crypto.subtle.exportKey(
      "jwk", //can be "jwk" or "raw"
      key
    );
  }
  encryption(initialVector, key, reader) {
    return window.crypto.subtle.encrypt(
      {
        name: ENCRYPTIONNAME,
        iv: initialVector,
        tagLength: TAGLENGTH
      },
      key,
      reader.result
    );
  }
  decrypt(initialVector, key, fileArray) {
    return window.crypto.subtle.decrypt(
      {
        name: ENCRYPTIONNAME,
        iv: initialVector,
        tagLength: TAGLENGTH
      },
      key,
      fileArray.buffer
    );
  }
  importKey(password) {
    return window.crypto.subtle.importKey(
      "jwk",
      {
        kty: "oct",
        k: password,
        alg: "A256GCM",
        ext: true
      },
      {
        name: ENCRYPTIONNAME,
        length: 256
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"]
    );
  }
}
