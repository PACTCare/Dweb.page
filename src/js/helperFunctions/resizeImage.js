export default function resizeImage(image, maxSize) {
  const canvas = document.createElement('canvas');
  let { width, height } = image;
  if (width > height) {
    if (width > maxSize) {
      height *= maxSize / width;
      width = maxSize;
    }
  } else if (height > maxSize) {
    width *= maxSize / height;
    height = maxSize;
  }
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.replace(/(\r\n|\n|\r)/gm, '');
}
