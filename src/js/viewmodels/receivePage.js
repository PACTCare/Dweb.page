import MIME from 'mime/lite';
import 'fast-text-encoding';
import Encryption from '../crypto/Encryption';
import getGateway from '../helperFunctions/getGateway';
import checkBrowserDirectOpen from '../helperFunctions/checkBrowserDirectOpen';
import { saveAs } from '../services/fileSaver';
import '../search/search';
import createLog from '../log/createLog';
import searchDb from '../search/searchDb';
import createMetadata from '../search/createMetadata';

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
  // TODO: create availability metha data propagation error
  // Avilibility metadata can only be created on public IPFS nodes
  // otherwise it's too reliable on the local network
  if (!GATEWAY.includes('localhost')
    && !GATEWAY.includes('127.0.0.1')
    && typeof window.searchSelection !== 'undefined'
    && window.searchSelection.fileId !== 'na') {
    // probably better integrate a button
    console.log('Unavailable metadata');
    createMetadata(window.searchSelection.fileId,
      window.searchSelection.fileName + window.searchSelection.fileType,
      GATEWAY,
      '=Unavailable on Dweb.page=');
  }
  reset();
  output('The file you’re requesting is difficult to load or not available at all!');
}

function propagationProgress() {
  if (fakeProgress >= 45) {
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
  if (fileInput.length !== 46
    && typeof fileInput !== 'undefined'
    && typeof window.searchSelection !== 'undefined'
    && window.searchSelection.fileId !== 'na') {
    fileInput = window.searchSelection.fileId;
    // TODO: remove subscriber if there are too many
    const count = await searchDb.subscription.where('address').equals(window.searchSelection.address).count();
    console.log(count);
    // only add new addresses
    if (count < 1) {
      await searchDb.subscription.add({
        address: window.searchSelection.address,
        blocked: 0, // 0 = false, 1 = true
        daysLoaded: 0,
      });
    }
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
                createLog(fileInput, fileName, false);
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
        // direct link for public content without search => get info from tangle

        const name = `${window.searchSelection.fileName}.${window.searchSelection.fileType}`;
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
