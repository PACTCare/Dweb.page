/**
 * Returns true if the website is hosted locally
 * @returns {boolean}
 */
export default function checkLocalGateway() {
  const localUrl = '.local';
  if (window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname === ''
    || window.location.hostname.indexOf(localUrl) >= 0
    || window.location.hostname.includes('::1')) {
    return true;
  }
  return false;
}
