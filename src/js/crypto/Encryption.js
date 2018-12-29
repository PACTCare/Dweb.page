export default class Encryption {
  constructor() {
    this.encryptionName = 'AES-GCM';
    this.tagLength = 128;
    this.keyFormat = 'jwk';
  }

  // todo keys should not be extractable
  generateKey() {
    return window.crypto.subtle.generateKey(
      {
        name: this.encryptionName,
        length: 256,
      },
      true, // whether the key is extractable
      ['encrypt', 'decrypt'],
    );
  }

  exportKey(key) {
    return window.crypto.subtle.exportKey(
      this.keyFormat,
      key,
    );
  }

  encryption(initialVector, key, reader) {
    return window.crypto.subtle.encrypt(
      {
        name: this.encryptionName,
        iv: initialVector,
        tagLength: this.tagLength,
      },
      key,
      reader.result,
    );
  }

  decrypt(initialVector, key, fileArray) {
    return window.crypto.subtle.decrypt(
      {
        name: this.encryptionName,
        iv: initialVector,
        tagLength: this.tagLength,
      },
      key,
      fileArray.buffer,
    );
  }

  importKey(password) {
    return window.crypto.subtle.importKey(
      this.keyFormat,
      {
        kty: 'oct',
        k: password,
        alg: 'A256GCM',
        ext: true,
      },
      {
        name: this.encryptionName,
        length: 256,
      },
      true, // whether the key is extractable (i.e. can be used in exportKey)
      ['encrypt', 'decrypt'],
    );
  }
}
