import resizeImage from '../helperFunctions/resizeImage';
import db from '../services/backgroundDb';

const maxSize = 1600;

function readBackgroundImage(event) {
  const reader = new FileReader();
  reader.onloadend = function onloadend(readerEvent) {
    const image = new Image();
    image.onload = async function imageResized() {
      const imageUrl = resizeImage(image, maxSize);
      await db.backgroundImg.add({ imageUrl });
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
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(file.name);
    if (isImage) {
      reader.readAsDataURL(file);
    }
  }
}

async function setBackgroundImage() {
  try {
    const getStoredImage = await db.backgroundImg.get({ id: 1 });
    if (typeof getStoredImage === 'undefined') {
      document.getElementById('resetImage').style.display = 'none';
      document
        .getElementsByTagName('body')[0]
        .style
        .backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("https://pact.online/background.jpeg")';
    } else {
      document.getElementById('resetImage').style.display = 'inherit';
      document
        .getElementsByTagName('body')[0]
        .style
        .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${getStoredImage.imageUrl}")`;
    }
    document.getElementById('filtersubmit').addEventListener('click', () => {
      document.getElementById('backgroundUpload').click();
    });
    document.getElementById('backgroundUpload').addEventListener('change', readBackgroundImage, false);
    document.getElementById('resetImage').addEventListener('click', async () => {
      await db.backgroundImg.clear();
      setBackgroundImage();
    });
  } catch (error) {
    console.log(error);
    document.getElementById('right').style.display = 'none';
    document.getElementById('resetImage').style.display = 'none';
    document
      .getElementsByTagName('body')[0]
      .style
      .backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("https://pact.online/background.jpeg")';
  }
}

// update vh on mobile
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  const vhResize = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vhResize}px`);
});

setBackgroundImage();
