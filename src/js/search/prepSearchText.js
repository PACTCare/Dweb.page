function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Shorten and extract description without cutting words
 * @param {string} str
 * @param {number} maxLen
 * @param {string} separator
 * @returns {string} Description
 */
export default function prepSearchText(str, maxLen, separator = ' ') {
  let localString = str;
  if (localString.includes('&&')) {
    const [, b] = localString.split('&&');
    localString = b.replace('&&', '');
  }
  localString = capFirstLetter(localString);
  if (localString.length <= maxLen) return localString;
  return localString.substr(0, localString.lastIndexOf(separator, maxLen));
}
