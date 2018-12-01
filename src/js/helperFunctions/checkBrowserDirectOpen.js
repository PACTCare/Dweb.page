/**
 * Checks if data should be open directly in browser or downloaded
 * @param {string} name
 */
export default function checkBrowserDirectOpen(name) {
  const browserFileTypes = ['.htm', '.css', '.js', '.txt', '.pdf', '.jpg', '.bmp', '.webm', '.wav',
    '.gif', '.jpeg', '.png', '.mp3', '.mp4', '.flac', '.ogg', '.ogv', '.svg', '.xml', '.json'];
  const str = name.toLowerCase();
  for (const i in browserFileTypes) {
    if (str.indexOf(browserFileTypes[i]) > -1) {
      console.log('true');
      return true;
    }
  }

  return false;
}
