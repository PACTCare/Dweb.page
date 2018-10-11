import jsrsasign from 'jsrsasign';

const CURVE = 'secp256k1';
const SIGALG = 'SHA256withECDSA';

let keypair;
const pkey1 = '\x63\x35\x34\x65\x34\x61\x38\x38\x32\x35\x35\x32\x33\x36\x35\x36\x33\x65\x39\x34\x65\x65\x66\x66';
const pkey2 = '44ad0c4f5bc3aea06c720a6';
const pukey1 = '\x30\x34\x36\x37\x61\x30\x31\x35\x39\x39\x35\x66\x30\x35\x30\x62\x30\x38\x64\x38\x37\x62\x31\x30\x63';
const pukey2 = '746166a55a66c29f3843abf131676b4';

// https://kjur.github.io/jsrsasign/sample/sample-ecdsa.html
// Alternative
// https://github.com/cryptocoinjs/secp256k1-node
export default class Signature {
  constructor() { }

  generateKeyPairHex() {
    const ec = new jsrsasign.KJUR.crypto.ECDSA({ curve: CURVE });
    keypair = ec.generateKeyPairHex();
    return this.tobase64(keypair.ecpubhex);
  }

  sign(msg) {
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: SIGALG });
    sig.init({
      d: keypair.ecprvhex,
      curve: CURVE,
    });
    sig.updateString(msg);
    return this.tobase64(sig.sign());
  }

  // only one additional obstacle
  pageSign(msg) {
    const pkey3 = '581bd74df08ebcdfc';
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: SIGALG });
    sig.init({
      d: pkey1 + pkey2 + pkey3,
      curve: CURVE,
    });
    sig.updateString(msg);
    return this.tobase64(sig.sign());
  }

  tobase64(text) {
    return new Buffer.from(text, 'hex').toString('base64');
  }

  tohex(text) {
    return new Buffer.from(text, 'base64').toString('hex');
  }

  verification(obj, pub64) {
    const pubHex = this.tohex(pub64);
    const msg = obj.id + obj.fileId + obj.time + obj.gateway + obj.upload + obj.encrypted;
    const sigValueHex = this.tohex(obj.signature);
    const sig = new jsrsasign.KJUR.crypto.Signature({
      alg: SIGALG,
      prov: 'cryptojs/jsrsa',
    });
    sig.init({
      xy: pubHex,
      curve: CURVE,
    });
    sig.updateString(msg);
    return sig.verify(sigValueHex);
  }

  // only one additional obstacle
  pageVerification(obj) {
    const pukey3 = 'c1a50da0d09cd6755d41f0a2edc103e08b20199214466d7f48d64f5f10b5d24c6a700850ba';
    const msg = obj.id + obj.fileId + obj.time + obj.gateway + obj.upload + obj.encrypted;
    const sigValueHex = this.tohex(obj.pageSignature);
    const sig = new jsrsasign.KJUR.crypto.Signature({
      alg: SIGALG,
      prov: 'cryptojs/jsrsa',
    });
    sig.init({
      xy: pukey1 + pukey2 + pukey3,
      curve: CURVE,
    });
    sig.updateString(msg);
    return sig.verify(sigValueHex);
  }
}
