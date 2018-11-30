/**
 * Checks if data should be open directly in browser or downloaded
 * @param {string} name
 */
export default function checkBrowserDirectOpen(name) {
  const browserFileTypes = ['.htm', '.css', '.js', '.txt', '.pdf', '.jpg', '.bmp', '.avi', '.mov', '.webm', '.wav',
    '.gif', '.jpeg', '.png', '.mp3', '.mp4', '.mpeg', '.mpg', '.ogg', '.svg'];
  const str = name.toLowerCase();
  for (const i in browserFileTypes) {
    if (str.indexOf(browserFileTypes[i]) > -1) {
      console.log('true');
      return true;
    }
  }

  return false;
}
