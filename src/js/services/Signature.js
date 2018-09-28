"use strict";
const r = require("jsrsasign");
const CURVE = "secp256k1";
const SIGALG = "SHA256withECDSA";

let keypair;

// https://kjur.github.io/jsrsasign/sample/sample-ecdsa.html
// Alternative
// https://github.com/cryptocoinjs/secp256k1-node
// https://blog.bitjson.com/just-released-webassembly-version-of-secp256k1-10x-faster-than-javascript-eb3cebe4d411
export class Signature {
  constructor() {}

  generateKeyPairHex(text) {
    var ec = new r.KJUR.crypto.ECDSA({ curve: CURVE });
    keypair = ec.generateKeyPairHex(text);
    return this.tobase64(keypair.ecpubhex);
  }

  sign(msg) {
    var sig = new r.KJUR.crypto.Signature({ alg: SIGALG });
    sig.init({
      d: keypair.ecprvhex,
      curve: CURVE
    });
    sig.updateString(msg);
    return this.tobase64(sig.sign());
  }

  tobase64(text) {
    return new Buffer.from(text, "hex").toString("base64");
  }

  tohex(text) {
    return new Buffer.from(text, "base64").toString("hex");
  }

  verification(obj, pub64) {
    let pubHex = this.tohex(pub64);
    let msg =
      obj.id + obj.fileId + obj.time + obj.gateway + obj.upload + obj.encrypted;
    let sigValueHex = this.tohex(obj.signature);
    var sig = new r.KJUR.crypto.Signature({
      alg: SIGALG,
      prov: "cryptojs/jsrsa"
    });
    sig.init({
      xy: pubHex,
      curve: CURVE
    });
    sig.updateString(msg);
    return sig.verify(sigValueHex);
  }
}
