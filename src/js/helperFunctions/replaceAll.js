
/**
 * Pre-processing it to escape special regular expression characters
 * @param {string} str
 */
function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

/**
 * Replace all occurrences of a string
 * @param {string} str
 * @param {string} find
 * @param {string} replace
 */
export default function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
