import jsrsasign from 'jsrsasign';

const CURVE = 'secp256k1';
const SIGALG = 'SHA256withECDSA';

let keypair;

// https://kjur.github.io/jsrsasign/sample/sample-ecdsa.html
// Alternative
// https://github.com/cryptocoinjs/secp256k1-node
export default class Signature {
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

  tobase64(text) {
    return new Buffer.from(text, 'hex').toString('base64');
  }

  tohex(text) {
    return new Buffer.from(text, 'base64').toString('hex');
  }

  verification(obj, pub64) {
    const pubHex = this.tohex(pub64);
    const msg = obj.id + obj.fileId + obj.time + obj.gateway;
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
}
