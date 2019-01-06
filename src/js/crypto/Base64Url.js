import replaceAll from '../helperFunctions/replaceAll';

function base64urlToBase64(base64url) {
  let test = replaceAll(base64url, '-', '+');
  test = replaceAll(test, '_', '/');
  return test;
}

function base64ToBase64Url(base64) {
  let test = replaceAll(base64, '+', '-');
  test = replaceAll(test, '/', '_');
  return test;
}

/**
 * Base64Url Converter Class
 */
export default class Base64Url {
  static FromHex(hexString) {
    return base64ToBase64Url(Buffer.from(hexString, 'hex').toString('base64')).replace('=', '');
  }

  static ToHex(base64UrlString) {
    return Buffer.from(base64urlToBase64(base64UrlString), 'base64').toString('hex');
  }
}
