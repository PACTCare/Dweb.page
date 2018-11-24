import MIME from 'mime/lite';
import 'fast-text-encoding';
import Iota from '../log/Iota';
import Encryption from '../services/Encryption';
import getGateway from '../helperFunctions/getGateway';
import Log from '../log/Log';
import { saveAs } from '../services/fileSaver';
import '../search/search';

const GATEWAY = getGateway();

/**
 * Outputs error messages
 * @param {string} msg
 */
function output(msg) {
  document.getElementById('messagesReceivePage').innerText = msg;
}

function downloadFile(fileId, fileName, blob, isEncrypted) {
  new Log().createLog(fileId, fileName, false, GATEWAY, isEncrypted, 'Not yet available');
  window.history.replaceState(null, null, window.location.pathname);
  saveAs(blob, fileName);
}

function progressBar(percent) {
  const elem = document.getElementById('loadBarReceive');
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    document.getElementById('loadProgressReceive').style.display = 'none';
  }
}

async function load() {
  const passwordInput = document.getElementById('passwordField').value.trim();
  let fileInput = document.getElementById('firstField').value.trim();
  if (fileInput.length !== 46 && typeof fileInput !== 'undefined' && document.getElementById('currentSelectedHiddenHash').innerText !== 'nix') {
    fileInput = document.getElementById('currentSelectedHiddenHash').innerText;
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
      document.getElementById('receiveResponse').style.display = 'block';
      document.getElementById('loadProgressReceive').style.display = 'block';
    };
    oReq.onload = async function onload() {
      const arrayBuffer = oReq.response;
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
                downloadFile(fileInput, fileName, blob, true);
              })
              .catch(() => {
                output('You have entered an invalid password!');
              });
          })
          .catch(() => {
            output('You have entered an invalid password!');
          });
      } else {
        // not encrypted, get information from IOTA
        const iota = new Iota();
        const transactions = await iota.getTransaction(fileInput);
        const logObj = await iota.getLog(transactions[transactions.length - 1]);
        const name = `${logObj.fileName}.${logObj.fileType}`;
        document.getElementById('firstField').value = '';
        // .htm and .html are exactly the same
        if (name.includes('.htm')) {
          window.open(GATEWAY + fileInput, '_self');
        } else {
          const typeM = MIME.getType(name);
          const blob = new Blob([arrayBuffer], { type: typeM });
          blob.name = name;
          downloadFile(fileInput, name, blob, false);
        }
      }
    };
    oReq.onprogress = function onprogress(e) {
      if (e.lengthComputable) {
        const per = Math.round((e.loaded * 100) / e.total);
        progressBar(per);
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
