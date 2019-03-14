import '@babel/polyfill';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDown, faArrowUp, faVideo, faMusic, faMobileAlt, faFileUpload, faShieldAlt, faPlayCircle,
  faExclamationCircle, faBars, faBan,
} from '@fortawesome/free-solid-svg-icons';
import {
  faEnvelope, faFile, faFolderOpen, faCopy, faImage, faStar,
} from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
import './viewmodels/fileupload';
import './viewmodels/copy';
import './viewmodels/background';
import './viewmodels/alert';
import './viewmodels/steps';
import './viewmodels/filePage';
import './viewmodels/receivePage';
import './viewmodels/navigation';
import './viewmodels/aboutPage';
import Starlog from './starlog/starlog';
import createTagsElement from './viewmodels/tags';
import Encryption from './crypto/Encryption';
import EncryptionBuf from './ipfs/EncryptionBuf';
import getGateway from './ipfs/getGateway';
import checkLocalGateway from './ipfs/checkLocalGateway';
import checkIsMobile from './helperFunctions/checkIsMobile';
import localUpload from './ipfs/localUpload';
import checkBrowserDirectOpen from './helperFunctions/checkBrowserDirectOpen';
import shuffleArray from './helperFunctions/shuffelArray';
import extractMetadata from './search/extractMetadata';
import '../css/style.css';
import '../css/toggle.css';
import '../css/steps.css';
import '../css/alert.css';
import '../css/menu.css';
import '../css/tags.css';
import favicon from '../img/favicon.png';
import logo from '../img/dweb.png';
import createMetadata from './search/createMetadata';
import createLog from './log/createLog';
import { DEFAULT_DESCRIPTION } from './search/searchConfig';
import { LIST_OF_IPFS_GATEWAYS, PUBLIC_GATEWAY_SIZE_LIMIT } from './ipfs/ipfsConfig';


library.add(faArrowDown, faArrowUp, faVideo, faMusic, faFile, faFolderOpen, faEnvelope,
  faMobileAlt, faCopy, faFileUpload, faShieldAlt,
  faPlayCircle, faExclamationCircle, faBars, faBan, faStar,
  faWhatsapp, faTelegramPlane, faImage);
dom.watch();
document.getElementById('logo1').src = logo;
document.getElementById('logo2').src = logo;
document.getElementById('favicon').href = favicon;
const JSZip = require('jszip');

const ISMOBILE = checkIsMobile();
const sizeLimit = checkLocalGateway() ? 10000000 : PUBLIC_GATEWAY_SIZE_LIMIT;

let gateway = getGateway();
let alreadyAdded = false;
let describtion = DEFAULT_DESCRIPTION;
let filename;
let fileId;

function progressBar(percent) {
  const elem = document.getElementById('loadBar');
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    document.getElementById('loadProgress').style.display = 'none';
  } else {
    document.getElementById('loadProgress').style.display = 'block';
  }
}

/**
 * Output messages
 * @param {string} msg
 */
function output(msg) {
  document.getElementById('messages').textContent = msg;
}

function prepareStepsLayout() {
  document.getElementById('file-upload-form').style.display = 'none';
  document.getElementById('headline').style.display = 'none';
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
function unencryptedLayout() {
  changeBackgroundColor('#db3e4d');
  document.getElementById('passwordStep').classList.remove('step');
  document.getElementById('passwordStep').style.display = 'none';
  document.getElementById('passwordTab').classList.remove('tabSteps');
  document.getElementById('passwordTab').style.display = 'none';
  let link = `${window.location.href}?id=${fileId}&password=np&name=${encodeURIComponent(filename)}`;
  if (checkBrowserDirectOpen(filename)) {
    link = gateway + fileId;
  }
  if (filename.includes('.htm')) {
    onlyLastTab();
    document.getElementById('doneHeadline').textContent = 'Your Dwebpage is Online!';
    document.getElementById('fileAvailable').innerHTML = `<p>Your distributed webpage is now available on IPFS: <a href='${link}' target='_blank'>${fileId}</a>. </p> <p style='margin-bottom: 0px;'>Send us your hash (plus feedback) via <a href="mailto:info@pact.online?subject=Keep hash online&body=Hi, %0D%0A %0D%0A Please keep the following hash online (called pinning): ${fileId}  %0D%0A Here are my feedback/ideas regarding dweb.page: %0D%0A %0D%0A %0D%0A Regards,">mail</a> to keep it online permanently.</p>`;
  } else {
    document.getElementById('doneHeadline').textContent = 'Step 2: Done';
    document.getElementById('emailSharer').href = `mailto:?subject=Distributed File Sharing with Dweb.page&body=Hi, %0D%0A %0D%0A I just shared a file with you on dweb.page. You can access it here: %0D%0A ${encodeURIComponent(
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

/**
 * User input of required starlog information
 */
function starlogEntryLayout() {
  const myNode = document.getElementById('tagsDiv');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  createTagsElement();
  document.getElementById('afterTags').style.display = 'none';
  document.getElementById('starlogEntryDiv').style.display = 'block';

  let licenseCode = 0;
  document.getElementById('selectCopyright').onchange = function selection() {
    if (this.value === 'Free to use') {
      document.getElementById('price').style.display = 'none';
      document.getElementById('price-input').value = 0;
      licenseCode = 1;
    } else if (this.value === 'Not for sale') {
      document.getElementById('price').style.display = 'none';
      document.getElementById('price-input').value = 0;
      licenseCode = 0;
    } else {
      document.getElementById('price').style.display = 'block';
      licenseCode = 0;
    }
  };

  const tagsDone = async function tagsDone() {
    const tags = document.getElementsByClassName('tag');
    let tagsString = '';
    for (let i = 0; i < tags.length; i += 1) {
      tagsString += ` ${tags[i].textContent}`;
    }
    document.getElementById('afterTags').style.display = 'block';
    document.getElementById('starlogEntryDiv').style.display = 'none';
    unencryptedLayout();
    if (describtion === DEFAULT_DESCRIPTION && tagsString.length > 0) {
      describtion = tagsString.trim();
    } else {
      // && marks the beginning of the describtion/end of tags
      describtion = `${tagsString.trim()}&&${describtion}`;
    }

    // TODO: activate create metadata
    const price = document.getElementById('price-input').value;
    createMetadata(fileId, filename, gateway, describtion, licenseCode, price);
  };


  // Add only once
  if (!alreadyAdded) {
    alreadyAdded = true;
    document.getElementById('sendTags').addEventListener('click', tagsDone);
  }
}


function encryptedLayout() {
  changeBackgroundColor('#3157a7');
  const link = `${window.location.href}?id=${fileId}`;
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').textContent = link;
  document.getElementById('emailSharer').href = `${'mailto:?subject=Distributed and Secure File Sharing with Dweb.page&body=Hi, %0D%0A %0D%0A To access the file I securely shared with you, you need to: %0D%0A %0D%0A'
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

function layoutSwitch(isEncrypted) {
  prepareStepsLayout();
  if (fileId == null || typeof fileId === 'undefined') {
    errorMessage("The current IPFS gateway you are using  isn't writable!");
  } else if (isEncrypted) {
    createLog(fileId, filename, true);
    encryptedLayout();
  } else {
    starlogEntryLayout();
  }
}

/**
 * Shows message if transfer fails
 * E.g. brave browser doesn't call layoutSwitch
 */
function transferFailed() {
  prepareStepsLayout();
  errorMessage("The current IPFS gateway you are using  isn't writable!");
}

async function uploadToIPFS(buf, isEncrypted) {
  // if local always upload on an additional public gateway
  if (checkLocalGateway()) {
    // TODO: big files/parallel
    fileId = await localUpload(buf);
  }
  if (checkLocalGateway() && fileId === undefined) {
    transferFailed();
  } else {
    const xhr = new XMLHttpRequest();
    if (checkLocalGateway()) {
      const [publicGateway] = shuffleArray(LIST_OF_IPFS_GATEWAYS);
      gateway = publicGateway;
    }
    xhr.open('POST', gateway, true);
    xhr.responseType = 'arraybuffer';
    xhr.timeout = 3600000;
    xhr.onreadystatechange = function onreadystatechange() {
      if (this.readyState === this.HEADERS_RECEIVED) {
        if (!checkLocalGateway()) {
          fileId = xhr.getResponseHeader('ipfs-hash');
        }
        layoutSwitch(isEncrypted);
      }
    };
    xhr.addEventListener('error', transferFailed);
    xhr.upload.onprogress = function onprogress(e) {
      if (e.lengthComputable) {
        const per = Math.round((e.loaded * 100) / e.total);
        progressBar(per);
      }
    };
    xhr.send(new Blob([buf]));
  }
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
      document.getElementById(
        'whatsappSharer',
      ).href = whatsappLink;
      document.getElementById('telegramSharer').href = `https://telegram.me/share/url?url=${
        window.location.href}`
        + `&text=Hi, here is your password to access the file: ${keyString}`;
    });
    const INTIALVECTOR = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptionPromise = enc.encryption(INTIALVECTOR, key, reader);
    encryptionPromise.then((encryptedData) => {
      uploadToIPFS(new EncryptionBuf().createBuf(filename, INTIALVECTOR, encryptedData), true);
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
    const zip = new JSZip();
    for (let i = 0; i < files.length; i += 1) {
      zip.file(files[i].name, files[i]);
    }
    zip.generateAsync({ type: 'blob' }).then((data) => {
      if (data.size <= sizeLimit * 1024 * 1024) {
        filename = `${files[0].name.split('.')[0]}.zip`;
        reader.readAsArrayBuffer(data);
      } else {
        output(`Please upload a smaller file (< ${sizeLimit} MB).`);
      }
    });
  } else {
    const file = files[0];
    if (file) {
      if (file.size <= sizeLimit * 1024 * 1024) {
        filename = file.name;
        reader.readAsArrayBuffer(file);
      }
    }
  }
}

async function start() {
  // init starlog
  window.starlog = new Starlog();
  await window.starlog.connect();
  // TODO: implement starlog connection error

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

window.onload = start();
