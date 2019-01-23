import resizeImage from '../helperFunctions/resizeImage';
import db from '../services/backgroundDb';

const MAXSIZE = 1600;

function readBackgroundImage(event) {
  const reader = new FileReader();
  reader.onloadend = function onloadend(readerEvent) {
    const image = new Image();
    image.onload = async function imageResized() {
      const imageUrl = resizeImage(image, MAXSIZE);
      await db.backgroundImg.add({ imageUrl });
      document.getElementById('resetImageDiv').style.display = 'inherit';
      document
        .getElementsByTagName('body')[0]
        .style
        .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${imageUrl}")`;
    };
    image.src = readerEvent.target.result;
    // Reset image, in case someone wants to upload two times the same image
    document.getElementById('backgroundUpload').value = '';
  };
  const file = event.target.files[0] || event.dataTransfer.files[0];
  if (file) {
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(file.name);
    if (isImage) {
      reader.readAsDataURL(file);
    }
  }
}

function setDefaultImage() {
  document.getElementById('resetImageDiv').style.display = 'none';
  document
    .getElementsByTagName('body')[0]
    .style
    .backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("https://pact.online/background.jpeg")';
}

async function setBackgroundImage() {
  try {
    const getStoredImage = await db.backgroundImg.get({ id: 1 });
    if (typeof getStoredImage === 'undefined') {
      setDefaultImage();
    } else {
      document.getElementById('resetImageDiv').style.display = 'inherit';
      document
        .getElementsByTagName('body')[0]
        .style
        .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${getStoredImage.imageUrl}")`;
    }
    document.getElementById('backgroundUpload').addEventListener('change', readBackgroundImage, false);
    document.getElementById('filtersubmitDiv').addEventListener('click', () => {
      document.getElementById('backgroundUpload').click();
    }, false);
    document.getElementById('resetImageDiv').addEventListener('click', async () => {
      await db.backgroundImg.clear();
      setDefaultImage();
    });
  } catch (error) {
    console.log(error);
    document.getElementById('right').style.display = 'none';
    setDefaultImage();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setBackgroundImage();
});
