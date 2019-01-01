function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Shorten and extract description without cutting words
 * @param {string} str
 * @param {number} maxLen
 * @param {string} separator
 */
export default function prepSearchText(str, maxLen, separator = ' ') {
  let localString = str;
  if (localString.includes('&&')) {
    const [, b] = localString.split('&&');
    localString = b;
  }
  localString = capFirstLetter(localString);
  if (localString.length <= maxLen) return str;
  return localString.substr(0, localString.lastIndexOf(separator, maxLen));
}
