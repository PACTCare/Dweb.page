import '@babel/polyfill';
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
import Log from './log/Log';
import Encryption from './services/Encryption';
import getGateway from './helperFunctions/getGateway';
import appendThreeBuffer from './helperFunctions/appendBuffers';
import checkIsMobile from './helperFunctions/checkIsMobile';
import keepIPFSStuffOnline from './helperFunctions/keepIPFSStuffOnline';
import '../css/style.css';
import '../css/toggle.css';
import '../css/steps.css';
import '../css/alert.css';
import '../css/menu.css';

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
  document.getElementById('messages').innerHTML = msg;
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
  document.getElementById('doneHeadline').innerText = 'Error';
  document.getElementById('doneHeadline').style.color = '#db3e4d';
  document.getElementById('fileAvailable').innerText = errorMsg;
  document.getElementById('fileAvailable').style.color = '#db3e4d';
}

function mobileLayout() {
  if (!ISMOBILE) {
    document.getElementById('explainText1').innerText = 'via Email or Copy Link';
    document.getElementById('smsSharer').style.display = 'none';
  } else {
    document.getElementById('explainText1').innerText = 'via Email, SMS or Copy Link';
    document.getElementById('smsSharer').style.display = 'inline-block';
  }
}

/**
 * Creates the unencrypted Layout, difference between html or not
 * @param {string} fileId
 */
function unencryptedLayout(fileId) {
  document.getElementById('passwordStep').classList.remove('step');
  document.getElementById('passwordStep').style.display = 'none';
  document.getElementById('passwordTab').classList.remove('tabSteps');
  document.getElementById('passwordTab').style.display = 'none';
  let link = `${
    window.location.href.replace('index.html', '')
  }index.html?id=${fileId}&password=nopass`;
  keepIPFSStuffOnline(fileId);
  if (filename.includes('.htm')) {
    link = GATEWAY + fileId;
    onlyLastTab();
    document.getElementById('doneHeadline').innerText = 'Your Dwebpage is Online!';
    document.getElementById('fileAvailable').innerHTML = `<p>Your distributed webpage is now available on IPFS: <a href='${link}' target='_blank'>${fileId}</a>. </p> <p style='margin-bottom: 0px;'>Send us your hash (plus feedback) via <a href="mailto:info@pact.online?subject=Keep hash online&body=Hi, %0D%0A %0D%0A Please keep the following hash online (called pinning): ${fileId}  %0D%0A Here are my feedback/ideas regarding pact.online: %0D%0A %0D%0A %0D%0A Regards,">mail</a> to keep it online permanently.</p>`;
  } else {
    document.getElementById('doneHeadline').innerText = 'Step 2: Done';
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
  document.getElementById('ipfsHash').innerText = link;
}

function encryptedLayout(fileId) {
  const link = `${window.location.href.replace('index.html', '')}index.html?id=${fileId}`;
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').innerText = link;
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
  xhr.onreadystatechange = async function onreadystatechange() {
    if (this.readyState === this.HEADERS_RECEIVED) {
      const fileId = xhr.getResponseHeader('ipfs-hash');
      if (fileId == null || typeof fileId === 'undefined') {
        prepareStepsLayout();
        errorMessage("The current IPFS gateway you are using  isn't writable!");
      } else {
        prepareStepsLayout();
        new Log().createLog(
          fileId,
          filename,
          true,
          GATEWAY,
          isEncrypted,
          describtion,
        );
        if (isEncrypted) {
          encryptedLayout(fileId);
        } else {
          unencryptedLayout(fileId, filename);
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
      document.getElementById('password').innerText = keyString;
      let whatsappLink = `https://api.whatsapp.com/send?text=${keyString}`;
      if (!ISMOBILE) {
        whatsappLink = `https://web.whatsapp.com/send?text=${keyString}`;
      }
      // what
      document.getElementById(
        'whatsappSharer',
      ).href = whatsappLink;
      document.getElementById('telegramSharer').href = `https://telegram.me/share/url?url=${
        window.location.href.replace('index.html', '')
      }index.html`
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
function extractMetadata(readerResult) {
  // unencrypted upload, metadata stored on IOTA!
  const enc = new TextDecoder('utf-8');
  const htmlText = enc.decode(readerResult);
  if (htmlText.toUpperCase().includes('!DOCTYPE HTML')) {
    describtion = (new DOMParser()).parseFromString(htmlText, 'text/html').documentElement.textContent.trim();
    if (htmlText.includes('<title>') && htmlText.includes('</title>')) {
      filename = htmlText.match(new RegExp('<title>(.*)</title>'));
      filename = `${filename[1]}.html`;
    }
  }
}

function readFile(e) {
  const reader = new FileReader();
  reader.onloadend = function onloadend() {
    mobileLayout();
    if (document.getElementById('endToEndCheck').checked) {
      encryptBeforeUpload(reader);
    } else {
      extractMetadata(reader.result);
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
