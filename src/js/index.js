import '@babel/polyfill';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faEnvelope, faMobileAlt, faFileUpload, faShieldAlt, faPlayCircle,
  faExclamationCircle, faFileSignature, faBars, faBan,
} from '@fortawesome/free-solid-svg-icons';
import { faCopy, faImage } from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
import './viewmodels/fileupload';
import './viewmodels/copy';
import './polyfill/webcrypto-shim';
import './polyfill/remove';
import './viewmodels/background';
import './viewmodels/alert';
import './viewmodels/steps';
import './viewmodels/historyPage';
import './viewmodels/receivePage';
import './viewmodels/navigation';
import './viewmodels/aboutPage';
import createTagsElement from './viewmodels/tags';
import FileType from './services/FileType';
import Log from './log/Log';
import Encryption from './services/Encryption';
import getGateway from './helperFunctions/getGateway';
import appendThreeBuffer from './helperFunctions/appendBuffers';
import checkIsMobile from './helperFunctions/checkIsMobile';
import keepIPFSStuffOnline from './helperFunctions/keepIPFSStuffOnline';
import checkBrowserDirectOpen from './helperFunctions/checkBrowserDirectOpen';
import extractMetadata from './search/extractMetadata';
import '../css/style.css';
import '../css/toggle.css';
import '../css/steps.css';
import '../css/alert.css';
import '../css/menu.css';
import '../css/tags.css';
import favicon from '../img/favicon.png';
import logo from '../img/dweb.png';


library.add(faEnvelope, faMobileAlt, faCopy, faFileUpload, faShieldAlt,
  faPlayCircle, faExclamationCircle, faFileSignature, faBars, faBan,
  faWhatsapp, faTelegramPlane, faImage);
dom.watch();
document.getElementById('logo1').src = logo;
document.getElementById('logo2').src = logo;
document.getElementById('favicon').href = favicon;
const JSZip = require('jszip');

const GATEWAY = getGateway();
const ISMOBILE = checkIsMobile();

let sizeLimit = 1000; // In MB
let describtion = 'Not yet available';
let filename;

// no upload limit if it's running local
if (GATEWAY.includes('localhost') || GATEWAY.includes('127.0.0.1')) {
  sizeLimit = 10000000;
}

function progressBar(percent) {
  const elem = document.getElementById('loadBar');
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    document.getElementById('loadProgress').style.display = 'none';
  } else {
    document.getElementById('loadProgress').style.display = 'block';
  }
}

function output(msg) {
  document.getElementById('messages').textContent = msg;
}

function prepareStepsLayout() {
  document.getElementById('file-upload-form').style.display = 'none';
  document.getElementById('headline').style.display = 'none';
  document.getElementById('adDoFrame').style.display = 'inline-block';
  document.getElementById('afterUpload').style.display = 'block';
}

function onlyLastTab() {
  document.getElementById('fileTab').classList.remove('tabSteps');
  document.getElementById('fileTab').style.display = 'none';
  document.getElementById('passwordTab').classList.remove('tabSteps');
  document.getElementById('passwordTab').style.display = 'none';
  document.getElementById('stepsDiv').style.display = 'none';
  document.getElementById('lastTab').style.display = 'block';
}

function errorMessage(errorMsg) {
  onlyLastTab();
  document.getElementById('doneHeadline').textContent = 'Error';
  document.getElementById('doneHeadline').style.color = '#db3e4d';
  document.getElementById('fileAvailable').textContent = errorMsg;
  document.getElementById('fileAvailable').style.color = '#db3e4d';
}

function mobileLayout() {
  if (!ISMOBILE) {
    document.getElementById('explainText1').textContent = 'via Email or Copy Link';
    document.getElementById('smsSharer').style.display = 'none';
  } else {
    document.getElementById('explainText1').textContent = 'via Email, SMS or Copy Link';
    document.getElementById('smsSharer').style.display = 'inline-block';
  }
}

function changeBackgroundColor(colorHex) {
  const elements = document.getElementsByClassName('share');
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.backgroundColor = colorHex;
  }
}

/**
 * Creates the unencrypted Layout, difference between html or not
 * @param {string} fileId
 */
function unencryptedLayout(fileId) {
  changeBackgroundColor('#db3e4d');
  document.getElementById('passwordStep').classList.remove('step');
  document.getElementById('passwordStep').style.display = 'none';
  document.getElementById('passwordTab').classList.remove('tabSteps');
  document.getElementById('passwordTab').style.display = 'none';
  let link = `${
    window.location.href
  }?id=${fileId}&password=nopass`;
  if (checkBrowserDirectOpen(filename)) {
    link = GATEWAY + fileId;
  }
  keepIPFSStuffOnline(fileId);
  if (filename.includes('.htm')) {
    onlyLastTab();
    document.getElementById('doneHeadline').textContent = 'Your Dwebpage is Online!';
    document.getElementById('fileAvailable').innerHTML = `<p>Your distributed webpage is now available on IPFS: <a href='${link}' target='_blank'>${fileId}</a>. </p> <p style='margin-bottom: 0px;'>Send us your hash (plus feedback) via <a href="mailto:info@pact.online?subject=Keep hash online&body=Hi, %0D%0A %0D%0A Please keep the following hash online (called pinning): ${fileId}  %0D%0A Here are my feedback/ideas regarding pact.online: %0D%0A %0D%0A %0D%0A Regards,">mail</a> to keep it online permanently.</p>`;
  } else {
    document.getElementById('doneHeadline').textContent = 'Step 2: Done';
    document.getElementById('emailSharer').href = `mailto:?subject=Distributed File Sharing with Pact.online&body=Hi, %0D%0A %0D%0A I just shared a file with you on pact.online. You can access it here: %0D%0A ${encodeURIComponent(
      link,
    )}%0D%0A %0D%0A Best Regards,`;
    if (ISMOBILE) {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        document.getElementById(
          'smsSharer',
        ).href = `sms:&body=Hi, I shared a file on: ${encodeURIComponent(link)}`;
      } else {
        document.getElementById(
          'smsSharer',
        ).href = `sms:?body=Hi, I shared a file on: ${encodeURIComponent(link)}`;
      }
    }
  }
  mobileLayout();
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').textContent = link;
}

function tagLayout(fileId) {
  const myNode = document.getElementById('tagsDiv');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  createTagsElement();
  document.getElementById('afterTags').style.display = 'none';
  document.getElementById('askForTags').style.display = 'block';
  document.getElementById('sendTags').addEventListener('click', () => {
    const tags = document.getElementsByClassName('tag');
    let tagsString = '';
    for (let i = 0; i < tags.length; i += 1) {
      tagsString += ` ${tags[i].textContent}`;
    }
    document.getElementById('afterTags').style.display = 'block';
    document.getElementById('askForTags').style.display = 'none';
    unencryptedLayout(fileId);
    if (describtion === 'Not yet available' && tagsString.length > 0) {
      describtion = tagsString.trim();
    } else {
      describtion = tagsString.trim() + describtion;
    }
    new Log().createLog(fileId, filename, true, GATEWAY, false, describtion);
  });
}


function encryptedLayout(fileId) {
  changeBackgroundColor('#3157a7');
  const link = `${window.location.href}?id=${fileId}`;
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').textContent = link;
  document.getElementById('emailSharer').href = `${'mailto:?subject=Distributed and Secure File Sharing with Pact.online&body=Hi, %0D%0A %0D%0A To access the file I securely shared with you, you need to: %0D%0A %0D%0A'
    + '1. Open the link below %0D%0A'
    + "2. Enter the password I'll share with you via WhatsApp or Telegram %0D%0A %0D%0A"
    + 'Link: '}${encodeURIComponent(link)}%0D%0A %0D%0A Best Regards,`;
  if (ISMOBILE) {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      document.getElementById(
        'smsSharer',
      ).href = `sms:&body=Hi, I shared a file on: ${encodeURIComponent(
        link,
      )} I'll send you the password on WhatsApp.`;
    } else {
      document.getElementById(
        'smsSharer',
      ).href = `sms:?body=Hi, I shared a file on: ${encodeURIComponent(
        link,
      )} I'll send you the password on WhatsApp.`;
    }
  }
}

function uploadToIPFS(buf, isEncrypted) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', GATEWAY, true);
  xhr.responseType = 'arraybuffer';
  xhr.timeout = 3600000;
  xhr.onreadystatechange = function onreadystatechange() {
    if (this.readyState === this.HEADERS_RECEIVED) {
      const fileId = xhr.getResponseHeader('ipfs-hash');
      prepareStepsLayout();
      if (fileId == null || typeof fileId === 'undefined') {
        errorMessage("The current IPFS gateway you are using  isn't writable!");
      } else {
        // if image/video create thumbnail
        const [, , fileTypePart] = filename.match(/(.*)\.(.*)/);
        if (FileType.imageTypes().indexOf(fileTypePart.toLowerCase()) > -1) {
          // 1. resize
          // upload on ipfs
          // only make sense if it loads faster!
        }
        if (isEncrypted) {
          new Log().createLog(
            fileId,
            filename,
            true,
            GATEWAY,
            isEncrypted,
            describtion,
          );
          encryptedLayout(fileId);
        } else {
          tagLayout(fileId);
        }
      }
    }
  };
  xhr.upload.onprogress = function onprogress(e) {
    if (e.lengthComputable) {
      const per = Math.round((e.loaded * 100) / e.total);
      progressBar(per);
    }
  };

  xhr.send(new Blob([buf]));
}

function encryptBeforeUpload(reader) {
  const enc = new Encryption();
  const keyPromise = enc.generateKey();
  keyPromise.then((key) => {
    const exportKeyPromise = enc.exportKey(key);
    exportKeyPromise.then((keydata) => {
      const keyString = keydata.k;
      document.getElementById('password').textContent = keyString;
      let whatsappLink = `https://api.whatsapp.com/send?text=${keyString}`;
      if (!ISMOBILE) {
        whatsappLink = `https://web.whatsapp.com/send?text=${keyString}`;
      }
      // what
      document.getElementById(
        'whatsappSharer',
      ).href = whatsappLink;
      document.getElementById('telegramSharer').href = `https://telegram.me/share/url?url=${
        window.location.href
      }`
        + `&text=Hi, here is your password to access the file: ${keyString}`;
    });
    const INTIALVECTOR = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptionPromise = enc.encryption(INTIALVECTOR, key, reader);
    encryptionPromise.then((encryptedData) => {
      const lenNumber = filename.length + 1000;
      const fileNameArray = Buffer.from(lenNumber + filename);
      const bufArray = appendThreeBuffer(
        fileNameArray,
        INTIALVECTOR,
        encryptedData,
      );
      const buf = bufArray;
      uploadToIPFS(buf, true);
    });
  });
}

function readFile(e) {
  const reader = new FileReader();
  reader.onloadend = function onloadend() {
    mobileLayout();
    if (document.getElementById('endToEndCheck').checked) {
      encryptBeforeUpload(reader);
    } else {
      const [nameMeta, desMeta] = extractMetadata(reader.result, filename);
      filename = nameMeta;
      describtion = desMeta;
      uploadToIPFS(reader.result, false);
    }
  };

  const files = e.target.files || e.dataTransfer.files;
  if (files.length > 1) {
    // zip it
    const zip = new JSZip();
    for (let i = 0; i < files.length; i += 1) {
      zip.file(files[i].name.replace(/[^A-Za-z0-9. _\-]/g, ''), files[i]);
    }
    zip.generateAsync({ type: 'blob' }).then((data) => {
      if (data.size <= sizeLimit * 1024 * 1024) {
        filename = `${files[0].name.replace(/[^A-Za-z0-9. _\-]/g, '').split('.')[0]}.zip`; // named after first file
        reader.readAsArrayBuffer(data); // Read Provided File
      } else {
        output(`Please upload a smaller file (< ${sizeLimit} MB).`);
      }
    });
  } else {
    const file = files[0];
    if (file) {
      if (file.size <= sizeLimit * 1024 * 1024) {
        filename = file.name.replace(/[^A-Za-z0-9. _\-]/g, ''); // ä causes problems
        reader.readAsArrayBuffer(file); // Read Provided File
      }
    }
  }
}

function upload() {
  document.getElementById('file-upload').addEventListener('change', readFile, false);
  document.getElementById('file-drag').addEventListener('drop', readFile, false);
}

document.getElementById('videoLink').addEventListener('click', () => {
  document.getElementById('video-ovelay').style.display = 'block';
});
document.getElementById('videoLink2').addEventListener('click', () => {
  document.getElementById('video-ovelay').style.display = 'block';
});
document.getElementById('video-ovelay').addEventListener('click', () => {
  document.getElementById('video-ovelay').style.display = 'none';
  const iframe = document.getElementById('htmlvideo').contentWindow;
  iframe.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
});

upload();
