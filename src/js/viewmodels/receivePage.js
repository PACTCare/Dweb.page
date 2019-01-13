import MIME from 'mime/lite';
import 'fast-text-encoding';
import Encryption from '../crypto/Encryption';
import getGateway from '../ipfs/getGateway';
import checkBrowserDirectOpen from '../helperFunctions/checkBrowserDirectOpen';
import { saveAs } from '../services/fileSaver';
import '../search/search';
import SubscriptionDb from '../search/SubscriptionDb';
import createLog from '../log/createLog';
import { LIST_OF_IPFS_GATEWAYS } from '../ipfs/ipfsConfig';
import createMetadata from '../search/createMetadata';
import { UNAVAILABLE_DESC } from '../search/searchConfig';

const GATEWAY = getGateway();
const errorMessage = 'The file you’re requesting is difficult to load or not available at all!';
let loadingRunning = false;
let blockOpen = false;
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
    document.getElementById('messagesSearch').textContent = msg;
  } else {
    document.getElementById('messagesReceivePage').textContent = msg;
  }
}

/**
 * Resets after loading
 */
function resetLoading() {
  fakeProgress = 0;
  hideLoadProgress();
  window.history.replaceState(null, null, window.location.pathname);
}

function downloadFile(fileName, blob) {
  resetLoading();
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
  resetLoading();
  output(errorMessage);
  blockOpen = true;
  // Availability metadata can only be reliable created on participating IPFS nodes
  // And only for data which is already be part of the search engine
  if (LIST_OF_IPFS_GATEWAYS.includes(GATEWAY)
    && typeof window.searchSelection !== 'undefined'
    && window.searchSelection.fileId !== 'na') {
    document.getElementById('markUnavailable').style.display = 'inline-block';
    document.getElementById('markUnavailable').addEventListener('click', () => {
      createMetadata(window.searchSelection.fileId,
        `${window.searchSelection.fileName}.${window.searchSelection.fileType}`,
        GATEWAY,
        UNAVAILABLE_DESC);
      document.getElementById('firstField').value = '';
      document.getElementById('messagesSearch').textContent = '';
      document.getElementById('markUnavailable').style.display = 'none';
    });
  }
}

/**
 * Shows fake progress for the first 50 percent = 30 seconds
 * After that sets 10 seconds time out
 */
function propagationProgress() {
  if (fakeProgress >= 50) {
    clearInterval(progressId);
    // open direct link instead
    timeOutPropagation = setTimeout(propagationError, 10000);
  } else {
    fakeProgress += 0.5;
    progressBar(fakeProgress);
  }
}

async function onload(arrayBuffer, passwordInput, fileInput, privateGateway) {
  if (!loadingRunning) {
    loadingRunning = true;
    if (typeof timeOutPropagation !== 'undefined') {
      clearTimeout(timeOutPropagation);
    }
    // encrypted
    if (passwordInput !== '' && passwordInput !== 'np') {
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
      // Check if it's opened via search (address available)
      // or link (address not available)
      if (typeof window.searchSelection.address !== 'undefined') {
        try {
          await new SubscriptionDb().addSubscribtion(window.searchSelection.address);
        } catch (error) {
          console.log(error);
        }
      }
      const name = `${window.searchSelection.fileName}.${window.searchSelection.fileType}`;
      document.getElementById('firstField').value = '';
      // file types which can be open inside a browser
      if (!blockOpen) {
        if (checkBrowserDirectOpen(name)) {
          window.open(privateGateway + fileInput, '_self');
        } else {
          const typeM = MIME.getType(name);
          const blob = new Blob([arrayBuffer], { type: typeM });
          blob.name = name;
          downloadFile(name, blob);
        }
      }
    }
  }
}

async function load() {
  blockOpen = false;
  const passwordInput = document.getElementById('passwordField').value.trim();
  let fileInput = document.getElementById('firstField').value.trim();
  if (fileInput.length !== 46
    && typeof fileInput !== 'undefined') {
    fileInput = window.searchSelection.fileId;
  }
  if (fileInput === 'wrongName' || (passwordInput.length === 43 && fileInput.length !== 46)) {
    // unencrypted files can be downloaded by name instead of file id!
    output('You have entered an invalid filename!');
  } else if (passwordInput.length !== 43 && passwordInput !== '' && passwordInput !== 'np') {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9_.-]*$/.test(passwordInput)) {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9]*$/.test(fileInput)) {
    output('You have entered an invalid filename!');
  } else {
    output('');
    document.getElementById('markUnavailable').style.display = 'none';
    const oReqLocal = new XMLHttpRequest();
    const oReqDirectLink = new XMLHttpRequest();
    let directLinkProgress = false;

    // link direct to upload gateway for faster transactions
    if (typeof window.searchSelection.uploadGateway !== 'undefined') {
      const { uploadGateway } = window.searchSelection;
      if (!uploadGateway.includes('localhost') && !uploadGateway.includes('127.0.0.1')) {
        directLinkProgress = true;
        oReqDirectLink.onloadstart = function onloadstart() {
          showLoadProgress();
          progressId = setInterval(propagationProgress, 200);
        };
        oReqDirectLink.onprogress = function onprogress(e) {
          if (fakeProgress < 50) {
            clearInterval(progressId);
            fakeProgress = 50;
          }
          if (e.lengthComputable) {
            const per = Math.round((e.loaded * 100) / e.total);
            progressBar(50 + (per / 2));
          }
        };
        oReqDirectLink.onreadystatechange = function onreadystatechange() {
          if (oReqDirectLink.readyState === 4) {
            if (oReqDirectLink.status !== 200) {
              output(errorMessage);
            }
          }
        };
        oReqDirectLink.onload = function onloadCallback() {
          onload(oReqDirectLink.response, passwordInput, fileInput, uploadGateway);
        };
        oReqDirectLink.open('GET', uploadGateway + fileInput, true);
        oReqDirectLink.responseType = 'arraybuffer';
        oReqDirectLink.send();
      }
    }
    if (!directLinkProgress) {
      oReqLocal.onloadstart = function onloadstart() {
        showLoadProgress();
        progressId = setInterval(propagationProgress, 200);
      };
      oReqLocal.onprogress = function onprogress(e) {
        if (fakeProgress < 50) {
          clearInterval(progressId);
          fakeProgress = 50;
        }
        if (e.lengthComputable) {
          const per = Math.round((e.loaded * 100) / e.total);
          progressBar(50 + (per / 2));
        }
      };
      oReqLocal.onreadystatechange = function onreadystatechange() {
        if (oReqDirectLink.readyState === 4) {
          if (oReqDirectLink.status !== 200) {
            output(errorMessage);
          }
        }
      };
    }

    oReqLocal.onload = function onloadCallback() {
      onload(oReqLocal.response, passwordInput, fileInput, GATEWAY);
    };
    oReqLocal.open('GET', GATEWAY + fileInput, true);
    oReqLocal.responseType = 'arraybuffer';
    oReqLocal.send();
  }
}

document.getElementById('load').addEventListener('click', () => {
  load();
});

document.getElementById('searchload').addEventListener('click', () => {
  isSearch = true;
  load();
});
