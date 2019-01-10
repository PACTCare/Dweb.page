import { DEFAULT_DESCRIPTION } from './searchConfig';

/**
 * Extracts the metadata out of an arraybuffer
 * Currently only works for html and txt
 * @param {ArrayBuffer} readerResult
 * @param {string} name
 * @returns {Array} [filename, describtion]
 */
export default function extractMetadata(readerResult, name) {
  let describtion = DEFAULT_DESCRIPTION;
  let filename = name;
  const enc = new TextDecoder('utf-8');
  const text = enc.decode(readerResult);
  // TODO: integrate support for more file types
  if (text.toUpperCase().includes('!DOCTYPE HTML')) {
    describtion = (new DOMParser()).parseFromString(text, 'text/html').documentElement.textContent.trim();
    if (text.includes('<title>') && text.includes('</title>')) {
      filename = text.match(new RegExp('<title>(.*)</title>'));
      filename = `${filename[1]}.html`;
    }
  } else if (filename.includes('.txt')) {
    describtion = text;
  }
  describtion = describtion.substring(0, 500);
  return [filename, describtion];
}
