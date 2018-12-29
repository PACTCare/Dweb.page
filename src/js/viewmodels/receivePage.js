import MIME from 'mime/lite';
import 'fast-text-encoding';
import Iota from '../iota/Iota';
import Encryption from '../crypto/Encryption';
import getGateway from '../helperFunctions/getGateway';
import checkBrowserDirectOpen from '../helperFunctions/checkBrowserDirectOpen';
import Log from '../iota/Log';
import { saveAs } from '../services/fileSaver';
import '../search/search';

const GATEWAY = getGateway();
let fakeProgress = 0;
let progressId;
let timeOutPropagation;
let isSearch = false;


function showLoadProgress() {
  if (isSearch) {
    document.getElementById('loadProgressSearch').style.display = 'block';
  } else {
    document.getElementById('loadProgressReceive').style.display = 'block';
  }
}

function hideLoadProgress() {
  if (isSearch) {
    document.getElementById('loadProgressSearch').style.display = 'none';
  } else {
    document.getElementById('loadProgressReceive').style.display = 'none';
  }
}

/**
 * Outputs error messages
 * @param {string} msg
 */
function output(msg) {
  if (isSearch) {
    console.log(msg);
    document.getElementById('messagesSearch').textContent = msg;
  } else {
    document.getElementById('messagesReceivePage').textContent = msg;
  }
}

function reset() {
  fakeProgress = 0;
  hideLoadProgress();
  window.history.replaceState(null, null, window.location.pathname);
}


function downloadFile(fileName, blob) {
  reset();
  saveAs(blob, fileName);
}

function progressBar(percent) {
  let elem = document.getElementById('loadBarReceive');
  if (isSearch) {
    elem = document.getElementById('loadBarSearch');
  }
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    hideLoadProgress();
  }
}

function propagationError() {
  reset();
  output('The file you’re requesting is difficult to load or not available at all!');
}

function propagationProgress() {
  if (fakeProgress >= 45) {
    // todo propagation error
    // if this happens often let people know this file no longer exists
    clearInterval(progressId);
    timeOutPropagation = setTimeout(propagationError, 10000);
  } else {
    fakeProgress += 0.5;
    progressBar(fakeProgress);
  }
}

function iotaDecryptionProgress() {
  if (fakeProgress >= 100) {
    clearInterval(progressId);
  } else {
    fakeProgress += 0.5;
    progressBar(fakeProgress);
  }
}

async function load() {
  const passwordInput = document.getElementById('passwordField').value.trim();
  let fileInput = document.getElementById('firstField').value.trim();
  if (fileInput.length !== 46 && typeof fileInput !== 'undefined' && document.getElementById('currentSelectedHiddenHash').textContent !== 'nix') {
    fileInput = document.getElementById('currentSelectedHiddenHash').textContent;
  }
  if (fileInput === 'wrongName' || (passwordInput.length === 43 && fileInput.length !== 46)) {
    // unencrypted files can be downloaded by name instead of file id!
    output('You have entered an invalid filename!');
  } else if (passwordInput.length !== 43 && passwordInput !== '' && passwordInput !== 'nopass') {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9_.-]*$/.test(passwordInput)) {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9]*$/.test(fileInput)) {
    output('You have entered an invalid filename!');
  } else {
    output('');
    const oReq = new XMLHttpRequest();
    // not encrypted, get information from IOTA,
    // but start already here, for parallel loading
    const iota = new Iota();
    const transactionPromise = iota.getTransaction(fileInput);
    oReq.onloadstart = function onloadstart() {
      showLoadProgress();
      progressId = setInterval(propagationProgress, 300);
    };
    oReq.onload = async function onload() {
      const arrayBuffer = oReq.response;
      fakeProgress = 95;
      progressId = setInterval(iotaDecryptionProgress, 100);
      // encrypted
      if (passwordInput !== '' && passwordInput !== 'nopass') {
        const fileNameLength = new TextDecoder('utf-8').decode(arrayBuffer.slice(0, 4)) - 1000;
        const fileName = new TextDecoder('utf-8').decode(
          arrayBuffer.slice(4, fileNameLength + 4),
        );
        const initialVector = new Uint8Array(
          arrayBuffer.slice(4 + fileNameLength, 16 + fileNameLength),
        );
        const fileArray = new Uint8Array(
          arrayBuffer.slice(16 + fileNameLength),
        );
        const enc = new Encryption();
        const keyPromise = enc.importKey(passwordInput);
        keyPromise
          .then((key) => {
            const decryptPromise = enc.decrypt(initialVector, key, fileArray);
            decryptPromise
              .then((decrypted) => {
                const typeM = MIME.getType(fileName);
                const blob = new Blob([decrypted], { type: typeM });
                blob.name = fileName;
                // logging of download only for private files
                new Log().createLog(fileInput, fileName, false, GATEWAY, true, 'Not yet available');
                downloadFile(fileName, blob);
              })
              .catch(() => {
                output('You have entered an invalid password!');
              });
          })
          .catch(() => {
            output('You have entered an invalid password!');
          });
      } else {
        const transactions = await transactionPromise;
        const logObj = await iota.getLog(transactions[transactions.length - 1]);
        const name = `${logObj.fileName}.${logObj.fileType}`;
        document.getElementById('firstField').value = '';
        // file types which can be open inside a browser
        if (checkBrowserDirectOpen(name)) {
          window.open(GATEWAY + fileInput, '_self');
        } else {
          const typeM = MIME.getType(name);
          const blob = new Blob([arrayBuffer], { type: typeM });
          blob.name = name;
          downloadFile(name, blob);
        }
      }
    };
    oReq.onprogress = function onprogress(e) {
      // progress starts only when file is loaded via IPFS
      // for search it take a load of time to actually start the loading
      if (typeof timeOutPropagation !== 'undefined') {
        clearTimeout(timeOutPropagation);
      }
      if (fakeProgress < 45) {
        clearInterval(progressId);
        fakeProgress = 45;
      }
      if (e.lengthComputable) {
        const per = Math.round((e.loaded * 100) / e.total);
        progressBar(40 + (per / 2));
      }
    };
    oReq.onreadystatechange = function onreadystatechange() {
      // Ready State 4 = operation completed
      if (oReq.readyState === 4) {
        if (oReq.status !== 200) {
          output('You have entered an invalid filename!');
        }
      }
    };

    oReq.open('GET', GATEWAY + fileInput, true);
    oReq.responseType = 'arraybuffer';
    oReq.send();
  }
}

document.getElementById('load').addEventListener('click', () => {
  load();
});

document.getElementById('searchload').addEventListener('click', () => {
  isSearch = true;
  load();
});
