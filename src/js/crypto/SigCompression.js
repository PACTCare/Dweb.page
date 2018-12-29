import Base64Url from './Base64Url';

const bigInt = require('big-integer');

// Consts for secp256r1
const prime = '115792089210356248762697446949407573530086143415290314195533631308867097853951';
const b = new bigInt('41058363725152142129326129780047268409114441015993725554835256314039467401291');
const pIdent = '28948022302589062190674361737351893382521535853822578548883407827216774463488';

/**
 * https://stackoverflow.com/questions/17171542/algorithm-for-elliptic-curve-point-compression
 */
export default class SigCompression {
  /**
  * Point compress elliptic curve secp256r1
  * @param {string} x base64url component
  * @param {string} y base64url component
  * @return {string} Compressed hex representation
  */
  static ECPointCompress(xArray, yArray) {
    const x = Base64Url.ToHex(xArray);
    const y = Base64Url.ToHex(yArray);
    // if odd == 03 else == 02
    let prefix = '03';
    if (parseInt(y[y.length - 1], 16) % 2 === 0) {
      prefix = '02';
    }
    return `${prefix}${x}`;
  }


  /**
   * Point decompress secp256r1
   * @param {string} Compressed representation in hex string
   * @return {string} Uncompressed representation in base64url string
   */
  static ECPointDecompress(comp) {
    const signY = new Number(comp[1]) - 2;
    const x = new bigInt(comp.substring(2), 16);
    let y = x.pow(3).subtract(x.multiply(3)).add(b).modPow(pIdent, prime);
    if (y.mod(2).toJSNumber() !== signY) {
      y = prime.subtract(y);
    }
    return {
      x: Base64Url.FromHex(x.toString(16), 64),
      y: Base64Url.FromHex(y.toString(16), 64),
    };
  }
}
