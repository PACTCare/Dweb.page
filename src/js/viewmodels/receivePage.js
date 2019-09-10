import MIME from 'mime/lite';
import 'fast-text-encoding';
import Encryption from '../crypto/Encryption';
import checkBrowserDirectOpen from '../helperFunctions/checkBrowserDirectOpen';
import { saveAs } from '../services/fileSaver';
import '../search/search';
import SubscriptionDb from '../search/SubscriptionDb';
import { IPFS_COMPANION_NO_REDIRECT, GATEWAY } from '../ipfs/ipfsConfig';
import createMetadata from '../search/createMetadata';
import { UNAVAILABLE_DESC } from '../search/searchConfig';
import EncryptionBuf from '../ipfs/EncryptionBuf';
import Error from '../error';

// TODO: Different upload gateways!

const errorMessage = 'The file you’re requesting is difficult to load or not available at all!';
let loadingRunning = false;
let blockOpen = false;
let fakeProgress = 0;
let progressId;
let timeOutPropagation;
let isSearch = false;
let directLinkProgress = true;

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
  if (typeof window.searchSelection !== 'undefined'
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

function onprogress(e) {
  if (fakeProgress < 50) {
    clearInterval(progressId);
    fakeProgress = 50;
  }
  if (e.lengthComputable) {
    const per = Math.round((e.loaded * 100) / e.total);
    progressBar(50 + (per / 2));
  }
}

function onloadstart() {
  showLoadProgress();
  progressId = setInterval(propagationProgress, 200);
}

async function onload(arrayBuffer, passwordInput) {
  if (!loadingRunning) {
    loadingRunning = true;
    if (typeof timeOutPropagation !== 'undefined') {
      clearTimeout(timeOutPropagation);
    }
    // encrypted
    if (passwordInput !== '' && passwordInput !== 'np') {
      const [fileName, initialVector, fileArray] = new EncryptionBuf().disassembleBuf(arrayBuffer);
      const enc = new Encryption();
      const keyPromise = enc.importKey(passwordInput);
      keyPromise.then((key) => {
        const decryptPromise = enc.decrypt(initialVector, key, fileArray);
        decryptPromise
          .then((decrypted) => {
            const typeM = MIME.getType(fileName);
            const blob = new Blob([decrypted], { type: typeM });
            blob.name = fileName;
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
          console.error(Error.ADD_DATABASE_ENTRY);
        }
      }
      const name = `${window.searchSelection.fileName}.${window.searchSelection.fileType}`;
      document.getElementById('firstField').value = '';
      if (!blockOpen) {
        const typeM = MIME.getType(name);
        const blob = new Blob([arrayBuffer], { type: typeM });
        blob.name = name;
        if (checkBrowserDirectOpen(name)) {
          const fileURL = URL.createObjectURL(blob);
          if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            window.open(fileURL, '_self');
          } else {
            // window open blob doesn't work in chrome
            const windowHash = '#iframe';
            window.location.hash = windowHash;
            document.write(`<iframe id="myFrame" src="${fileURL}" style="position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"></iframe>`);
            setInterval(() => {
              if (window.location.hash !== windowHash) {
                window.location.reload();
              }
            }, 100);
          }
        } else {
          downloadFile(name, blob);
        }
      }
    }
  }
}

/**
 * Loads the data via a link to a gateways
 * @param {*} passwordInput
 * @param {*} fileInput
 */
function directLinkLoading(passwordInput, fileInput) {
  const oReqDirectLink = new XMLHttpRequest();
  oReqDirectLink.onloadstart = function startCallback() { onloadstart(); };
  oReqDirectLink.onprogress = function onProgressCallback(event) { onprogress(event); };
  oReqDirectLink.onreadystatechange = function onreadystatechange() {
    if (oReqDirectLink.readyState === 4) {
      if (oReqDirectLink.status === 0) {
        // e.g., direct link gateway no longer exists!
        directLinkProgress = false;
      } else if (oReqDirectLink.status !== 200) {
        output(errorMessage);
      }
    }
  };
  oReqDirectLink.onload = function onloadCallback() {
    onload(oReqDirectLink.response, passwordInput);
  };
  oReqDirectLink.open('GET', GATEWAY + fileInput + IPFS_COMPANION_NO_REDIRECT, true);
  oReqDirectLink.responseType = 'arraybuffer';
  oReqDirectLink.send();
}

/**
 * Loads the data via IPFS
 * @param {*} passwordInput
 * @param {*} fileInput
 */
function ipfsLoading(passwordInput, fileInput) {
  console.log('Direct IPFS loading');
  if (!directLinkProgress) {
    window.ipfsNode.cat(fileInput, (err, data) => {
      if (err) return console.error(err);

      // convert Buffer back to string
      onload(data, passwordInput);
    });
  }
}

/**
 * Starts direct link loading and/or IPFS loading
 */
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
  } else if (fileInput === 'na') {
    // openend through search and nothing was found
    output('Sorry, no results found!');
  } else {
    output('');
    document.getElementById('markUnavailable').style.display = 'none';

    // TODO: progress bar doesn't reset
    directLinkLoading(passwordInput, fileInput);

    await setTimeout(() => { ipfsLoading(passwordInput, fileInput); },
      1000);
  }
}

document.getElementById('load').addEventListener('click', () => {
  load();
});

document.getElementById('searchload').addEventListener('click', () => {
  isSearch = true;
  loadingRunning = false;
  load();
});
