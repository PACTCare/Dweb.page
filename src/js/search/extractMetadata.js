export default function extractMetadata(readerResult, name) {
  // unencrypted upload, metadata stored on IOTA!
  let describtion = 'Not yet available';
  let filename = name;
  const enc = new TextDecoder('utf-8');
  const text = enc.decode(readerResult);
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
