import resizeImage from '../helperFunctions/resizeImage';

const maxSize = 1600;
const key = 'backgroundImage';
const storeNames = 'ImageStore';

const request = indexedDB.open('ImageDB', 1);
let db;

function readBackgroundImage(event) {
  const reader = new FileReader();
  reader.onloadend = function onloadend(readerEvent) {
    const image = new Image();
    image.onload = function imageResized() {
      const imageUrl = resizeImage(image, maxSize);
      // safe in indexDB instead
      const tx = db.transaction([storeNames], 'readwrite');
      tx.objectStore(storeNames).put(imageUrl, key);
      tx.oncomplete = function imageStored(e) {
        document.getElementById('resetImage').style.display = 'inherit';
        document
          .getElementsByTagName('body')[0]
          .style
          .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${imageUrl}")`;
      };
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

function setBackgroundImage() {
  const tx = db.transaction([storeNames]);
  const getStoredImage = tx.objectStore(storeNames).get(key);
  getStoredImage.onsuccess = function presentStoredImage() {
    if (typeof getStoredImage.result === 'undefined') {
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
        .backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("${getStoredImage.result}")`;
    }
  };
}

function startDatabase() {
  request.onupgradeneeded = function databaseUpgrade(e) {
    const dbLocal = e.target.result;
    dbLocal.createObjectStore(storeNames);
  };

  request.onsuccess = function databaseLoaded(e) {
    db = e.target.result;
    setBackgroundImage();
    document.getElementById('backgroundUpload').addEventListener('change', readBackgroundImage, false);
    document.getElementById('filtersubmit').addEventListener('click', () => {
      document.getElementById('backgroundUpload').click();
    });
    document.getElementById('resetImage').addEventListener('click', () => {
      const tx = db.transaction([storeNames], 'readwrite');
      tx.objectStore(storeNames).delete(key);
      setBackgroundImage();
    });
  };

  request.onerror = function databaseError(e) {
    console.log('ImageDB error - Private mode');
    document.getElementById('right').style.display = 'none';
    document.getElementById('resetImage').style.display = 'none';
    document
      .getElementsByTagName('body')[0]
      .style
      .backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35)), url("https://pact.online/background.jpeg")';
  };
}

// update vh on mobile
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  const vhResize = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vhResize}px`);
});

startDatabase();
