import '@babel/polyfill';
import './fileupload';
import './copy';
import './alert';
import './steps';
import './polyfill/webcrypto-shim';
import './polyfill/remove';
import Log from './log/Log';
import './services/background';
import Encryption from './services/Encryption';
import Ping from './services/Ping';
import '../css/style.css';
import '../css/toggle.css';
import '../css/steps.css';
import '../css/alert.css';

const SIZELIMIT = 1000; // In MB
const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
let filename;

function progressBar(percent) {
  const elem = document.getElementById('loadBar');
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    document.getElementById('loadProgress').style.display = 'none';
  }
}

const appendBuffer2 = function appendBuffer2(buffer1, buffer2) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

const appendBuffer3 = function appendBuffer3(buffer1, buffer2, buffer3) {
  const tmp = new Uint8Array(
    buffer1.byteLength + buffer2.byteLength + buffer3.byteLength,
  );
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  tmp.set(new Uint8Array(buffer3), buffer1.byteLength + buffer2.byteLength);
  return tmp.buffer;
};

function prepareStepsLayout() {
  document.getElementById('file-upload-form').style.display = 'none';
  document.getElementById('headline').style.display = 'none';
  document
    .getElementById('adDoFrame')
    .setAttribute('style', 'display:inline-block !important');
  document
    .getElementById('afterUpload')
    .setAttribute('style', 'display:block !important');
}

function OpenOnMobile() {
  let isMobile = false;
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent,
    )
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4),
    )
  ) {
    isMobile = true;
  }
  return isMobile;
}

function errorMessage(errorMsg) {
  document.getElementById('fileTab').remove();
  document.getElementById('passwordTab').remove();
  document.getElementById('stepsDiv').remove();
  document
    .getElementById('lastTab')
    .setAttribute('style', 'display:block !important');
  document.getElementById('doneHeadline').innerHTML = 'Error';
  document.getElementById('doneHeadline').style.color = '#db3e4d';
  document.getElementById('fileAvailable').innerHTML = errorMsg;
  document.getElementById('fileAvailable').style.color = '#db3e4d';
}

function unencryptedLayout(fingerPrint, isMobile) {
  document.getElementById('passwordStep').remove();
  document.getElementById('passwordTab').remove();
  document.getElementById('doneHeadline').innerHTML = 'Step 2: Done';
  const link = `${
    window.location.href
  }receive.html?id=${fingerPrint}&password=nopass`;
  document.getElementById('emailSharer').href = `mailto:?subject=Decentralized File Sharing with Pact.online&body=Hi, %0D%0A %0D%0A I just shared a file with you on pact.online. You can access it here: %0D%0A ${encodeURIComponent(
    link,
  )}%0D%0A %0D%0A` + 'Best Regards,';
  if (isMobile) {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      document.getElementById(
        'smsSharer',
      ).href = `sms:&body=Hi, I shared a file on: ${encodeURIComponent(link)}`;
    } else {
      document.getElementById(
        'smsSharer',
      ).href = `sms:?body=Hi, I shared a file on: ${encodeURIComponent(link)}`;
    }
  } else {
    document.getElementById('smsSharer').style.display = 'none';
  }
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').innerText = link;
}

function encryptedLayout(fingerPrint, isMobile) {
  const link = `${window.location.href}receive.html?id=${fingerPrint}`;
  document.getElementById('ipfsHash').href = link;
  document.getElementById('ipfsHash').innerText = link;
  document.getElementById('emailSharer').href = `${'mailto:?subject=Decentralized and Secure File Sharing with Pact.online&body=Hi, %0D%0A %0D%0A To access the file I securely shared with you, you need to: %0D%0A %0D%0A'
    + '1. Open the link below %0D%0A'
    + "2. Enter the password I'll share with you via WhatsApp or Telegram %0D%0A %0D%0A"
    + 'Link: '}${encodeURIComponent(link)}%0D%0A %0D%0A` + 'Best Regards,';
  if (isMobile) {
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
  } else {
    document.getElementById('smsSharer').style.display = 'none';
  }
}

function uploadToIPFS(buf, isEncrypted) {
  let gateway = 'http://localhost:8080/ipfs/';
  if (HOST !== 'localhost' && HOST !== '127.0.0.1') {
    gateway = `${PROTOCOL}//${HOST}/ipfs/`;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', gateway, true);
  xhr.responseType = 'arraybuffer';
  xhr.timeout = 3600000;
  xhr.onreadystatechange = async function onreadystatechange() {
    if (this.readyState === this.HEADERS_RECEIVED) {
      const fingerPrint = xhr.getResponseHeader('ipfs-hash');
      const isMobile = OpenOnMobile();
      if (fingerPrint == null || typeof fingerPrint === 'undefined') {
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
            fingerPrint,
            filename,
            true,
            gateway,
            isEncrypted,
          );
          if (isEncrypted) {
            encryptedLayout(fingerPrint, isMobile);
          } else {
            unencryptedLayout(fingerPrint, isMobile);
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
      document.getElementById(
        'whatsappSharer',
      ).href = `https://api.whatsapp.com/send?text=${keyString}`;
      document.getElementById('telegramSharer').href = `https://telegram.me/share/url?url=${
        window.location.href
      }receive.html`
        + `&text=Hi, here is your password to access the file: ${keyString}`;
    });
    const INTIALVECTOR = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptionPromise = enc.encryption(INTIALVECTOR, key, reader);
    encryptionPromise.then((encryptedData) => {
      const lenNumber = filename.length + 1000;
      const fileNameArray = Buffer.from(lenNumber + filename);
      const bufArray = appendBuffer3(
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
    if (document.getElementById('endToEndCheck').checked) {
      encryptBeforeUpload(reader);
    } else {
      const lenNumber = filename.length + 1000;
      const fileNameArray = Buffer.from(lenNumber + filename);
      const bufArray = appendBuffer2(fileNameArray, reader.result);
      uploadToIPFS(bufArray, false);
    }
  };

  const file = e.target.files[0] || e.dataTransfer.files[0];
  if (file) {
    if (file.size <= SIZELIMIT * 1024 * 1024) {
      filename = file.name.replace(/[^A-Za-z0-9. _\-]/g, ''); // ä causes problems
      reader.readAsArrayBuffer(file); // Read Provided File
    }
  }
}

function upload() {
  const fileSelect = document.getElementById('file-upload');
  const fileDrag = document.getElementById('file-drag');
  fileSelect.addEventListener('change', readFile, false);
  fileDrag.addEventListener('drop', readFile, false);
}

upload();
