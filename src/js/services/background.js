const localStorageKey = 'imgData';
const maxSize = 1200;

function readBackgroundImage(event) {
  const reader = new FileReader();
  reader.onloadend = function onloadend(readerEvent) {
    const image = new Image();
    image.onload = function imageResized() {
      // Resize the image
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
      const imageUrl = dataUrl.replace(/(\r\n|\n|\r)/gm, '');
      window.localStorage.setItem(localStorageKey, imageUrl);
      document.getElementById('resetImage').style.display = 'inherit';
      document
        .getElementsByTagName('body')[0]
        .style
        .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${imageUrl}")`;
    };
    image.src = readerEvent.target.result;
  };
  const file = event.target.files[0] || event.dataTransfer.files[0];
  if (file) {
    reader.readAsDataURL(file);
  }
}

function setBackgroundImage() {
  let imageUrl = window.localStorage.getItem(localStorageKey);
  if (imageUrl == null) {
    imageUrl = 'https://pact.online/background.jpeg';
    document.getElementById('resetImage').style.display = 'none';
  } else {
    document.getElementById('resetImage').style.display = 'inherit';
  }
  document
    .getElementsByTagName('body')[0]
    .style
    .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${imageUrl}")`;
}

setBackgroundImage();

document.getElementById('filtersubmit').addEventListener('click', () => {
  document.getElementById('backgroundUpload').click();
});

document.getElementById('resetImage').addEventListener('click', () => {
  window.localStorage.removeItem(localStorageKey);
  setBackgroundImage();
});

document.getElementById('backgroundUpload').addEventListener('change', readBackgroundImage, false);

// update vh on mobile
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  const vhResize = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vhResize}px`);
});
