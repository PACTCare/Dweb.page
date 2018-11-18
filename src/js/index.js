import '@babel/polyfill';
import './fileupload';
import './copy';
import './alert';
import './steps';
import './receivePage';
import './historyPage';
import './aboutPage';
import './polyfill/webcrypto-shim';
import './polyfill/remove';
import './services/background';
import Log from './log/Log';
import Encryption from './services/Encryption';
import Ping from './services/Ping';
import getGateway from './helperFunctions/getGateway';
import getURLParameter from './helperFunctions/urlParameter';
import appendThreeBuffer from './helperFunctions/appendBuffers';
import checkIsMobile from './helperFunctions/checkIsMobile';
import '../css/style.css';
import '../css/toggle.css';
import '../css/steps.css';
import '../css/alert.css';
import '../css/menu.css';

const JSZip = require('jszip');

const GATEWAY = getGateway();
const ISMOBILE = checkIsMobile();

let sizeLimit = 1000; // In MB

// no upload limit if it's running local
if (GATEWAY.includes('localhost') || GATEWAY.includes('127.0.0.1')) {
  sizeLimit = 10000000;
  document.getElementById('limitText').style.display = 'none';
}

let filename;


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

function errorMessage(errorMsg) {
  // remove
  document.getElementById('fileTab').classList.remove('tabSteps');
  document.getElementById('passwordTab').classList.remove('tabSteps');
  document.getElementById('stepsDiv').style.display = 'none';
  document
    .getElementById('lastTab')
    .setAttribute('style', 'display:block !important');
  document.getElementById('doneHeadline').innerText = 'Error';
  document.getElementById('doneHeadline').style.color = '#db3e4d';
  document.getElementById('fileAvailable').innerText = errorMsg;
  document.getElementById('fileAvailable').style.color = '#db3e4d';
}

function mobileLayout() {
  if (!ISMOBILE || filename.includes('.html')) {
    document.getElementById('explainText1').innerText = 'via Email or Copy Link';
    document.getElementById('smsSharer').style.display = 'none';
  } else {
    document.getElementById('explainText1').innerText = 'via Email, SMS or Copy Link';
    document.getElementById('smsSharer').style.display = 'block';
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
  document.getElementById('doneHeadline').innerText = 'Step 2: Done';
  let link = `${
    window.location.href.replace('index.html', '')
  }index.html?id=${fileId}&password=nopass`;
  if (filename.includes('.html')) {
    link = GATEWAY + fileId;
    document.getElementById('fileLink').innerText = 'Share Page  > ';
    document.getElementById('fileLinkHeadline').innerText = 'Step 1: Share your Webpage';
    document.getElementById('fileAvailable').innerHTML = `Your distributed webpage is now available on IPFS. <br> Send us your hash (plus feedback) via <a href="mailto:info@pact.online?subject=Keep hash online&body=Hi, %0D%0A %0D%0A Please keep the following hash online (called pinning): ${fileId}  %0D%0A Here are my feedback/ideas regarding pact.online: %0D%0A %0D%0A %0D%0A Regards,">mail</a> to keep it online.`;
    document.getElementById('emailSharer').href = `mailto:?subject=Distributed Webpage created with Pact.online&body=Hi, %0D%0A %0D%0A I just created a distributed webpage with pact.online. You can access it here: %0D%0A ${encodeURIComponent(
      link,
    )}%0D%0A %0D%0A Best Regards,`;
  } else {
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
        const p = new Ping();
        p.ping((err) => {
          prepareStepsLayout();
          if (err) {
            errorMessage('Something is blocking the log entry!');
          }
          new Log().createLog(
            fileId,
            filename,
            true,
            GATEWAY,
            isEncrypted,
            'Not yet available',
          );
          if (isEncrypted) {
            encryptedLayout(fileId);
          } else {
            unencryptedLayout(fileId, filename);
          }
        });
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
function readFile(e) {
  const reader = new FileReader();
  reader.onloadend = function onloadend() {
    mobileLayout();
    if (document.getElementById('endToEndCheck').checked) {
      encryptBeforeUpload(reader);
    } else {
      // unencrypted upload, metadata stored on IOTA!
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

function menuAnimation(inputId) {
  // reset upload page, receive etc.
  document.getElementById('show-menu').checked = false;
  const ids = ['receivePage', 'historyPage', 'index', 'aboutPage'];
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i] === inputId) {
      document.getElementById(ids[i]).style.transition = 'visibility 0.2s,transform 0.2s, opacity 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)';
      document.getElementById(ids[i]).style.visibility = 'visible';
      document.getElementById(ids[i]).style.height = '100%';
      document.getElementById(ids[i]).style.width = '100%';
      document.getElementById(ids[i]).style.transform = 'scale(1)';
      document.getElementById(ids[i]).style.opacity = '1';
    } else {
      document.getElementById(ids[i]).style.transition = 'none';
      document.getElementById(ids[i]).style.visibility = 'hidden';
      document.getElementById(ids[i]).style.height = '0%';
      document.getElementById(ids[i]).style.width = '0%';
      document.getElementById(ids[i]).style.transform = 'scale(0.9)';
      document.getElementById(ids[i]).style.opacity = '0%';
    }
  }
}

function isIE() {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE '); // IE 10 or older
  const trident = ua.indexOf('Trident/'); // IE 11
  return (msie > 0 || trident > 0);
}


function indexInit() {
  document.getElementById('fileLink').innerText = 'File Link > ';
  document.getElementById('passwordDiv').style.display = 'block';
  document.getElementById('passwordStep').innerText = 'Password > ';
  document.getElementById('passwordStep').style.display = 'inline-block';
  document.getElementById('fileLinkHeadline').innerText = 'Step 1: Share File Link';
  document.getElementById('secondStepHeadline').innerText = 'Step 2: Share Password';
  document.getElementById('doneHeadline').innerText = 'Step 3: Done';
  document.getElementById('fileAvailable').innerHTML = 'Your file is available for 3 days.<br> You can find your sharing history <a onclick="openHistory()" style="color: #6d91c7;cursor: pointer;">here</a>.';
  document.getElementById('file-upload-form').style.display = 'block';
  document.getElementById('headline').style.display = 'block';
  document.getElementById('afterUpload').style.display = 'none';
  document.getElementById('adDoFrame').style.display = 'none';
  document.getElementById('start').style.display = 'block';
  document.getElementById('response').style.display = 'none';
  document.getElementById('file-image').style.display = 'none';
  document.getElementById('file-upload').value = '';
  document.getElementById('stepsDiv').style.display = 'block';
  document.getElementById('fileTab').classList.add('tabSteps');
  document.getElementById('passwordTab').classList.add('tabSteps');
  document.getElementById('passwordStep').classList.add('step');
}

function receiveInit() {
  document
    .getElementById('firstField')
    .addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById('load').click();
      }
    });
  document.getElementById('searchHeadline').innerText = 'Search';
  document.getElementById('currentSelectedHiddenHash').innerText = 'nix';
  document.getElementById('firstField').style.display = 'block';
  document.getElementById('receiveResponse').style.display = 'none';
  document.getElementById('firstField').value = '';
  document.getElementById('passwordField').style.display = 'none';
  document.getElementById('searchHeadline').style.marginBottom = '1.5rem';
  window.history.replaceState(null, null, window.location.pathname);
}

function linkInit() {
  document.getElementById('searchHeadline').innerText = 'Receive File';
  document.getElementById('firstField').style.display = 'none';
  document.getElementById('receiveResponse').style.display = 'none';
  document.getElementById('searchHeadline').style.marginBottom = '0rem';
}

function aboutInit() {
  document.getElementById('defaultOpen').click();
}

function currentPage(inputId) {
  const ids = ['toIndex', 'toReceive', 'toHistory', 'toAbout'];
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i] === inputId) {
      document.getElementById(ids[i]).classList.add('currentPage');
      if (ids[i] === 'toReceive') {
        receiveInit();
        if (!isIE()) {
          window.setTimeout(() => {
            document.getElementById('firstField').focus();
          }, 100);
        }
      } else if (ids[i] === 'toIndex') {
        indexInit();
      } else if (ids[i] === 'toAbout') {
        aboutInit();
      }
    } else {
      document.getElementById(ids[i]).classList.remove('currentPage');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialization
  indexInit();
  const urlParameter = getURLParameter('par');
  const fileIdPar = getURLParameter('id');
  const passwordPar = getURLParameter('password');
  if (urlParameter === 'terms' || urlParameter === 'privacy') {
    document.getElementById('dialog-ovelay').style.display = 'none';
    menuAnimation('aboutPage');
    currentPage('toAbout');
    if (urlParameter === 'terms') {
      document.getElementById('terms').click();
    } else if (urlParameter === 'privacy') {
      document.getElementById('privacy').click();
    }
  } else if (typeof fileIdPar !== 'undefined') {
    menuAnimation('receivePage');
    currentPage('');
    linkInit();
    document.getElementById('firstField').value = fileIdPar;
    if (typeof passwordPar !== 'undefined') {
      document.getElementById('passwordField').value = passwordPar;
      document.getElementById('passwordField').style.display = 'none';
    } else {
      document.getElementById('passwordField').style.display = 'block';
      if (!isIE()) { document.getElementById('passwordField').focus(); }
      document
        .getElementById('passwordField')
        .addEventListener('keyup', (event) => {
          event.preventDefault();
          if (event.keyCode === 13) {
            document.getElementById('load').click();
          }
        });
    }
  } else {
    document.getElementById('toIndex').classList.add('currentPage');
  }
});

window.openHistory = function openHistory() {
  menuAnimation('historyPage');
  currentPage('toHistory');
};

document.getElementById('toIndex').addEventListener('click', () => {
  menuAnimation('index');
  currentPage('toIndex');
});

document.getElementById('newUpload').addEventListener('click', () => {
  menuAnimation('index');
  currentPage('toIndex');
});

document.getElementById('toReceive').addEventListener('click', () => {
  menuAnimation('receivePage');
  currentPage('toReceive');
});
document.getElementById('toHistory').addEventListener('click', () => {
  window.openHistory();
});
document.getElementById('toAbout').addEventListener('click', () => {
  menuAnimation('aboutPage');
  currentPage('toAbout');
});

upload();
