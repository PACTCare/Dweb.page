import '@babel/polyfill';
import MIME from 'mime/lite';
import 'fast-text-encoding';
import './alert';
import './url-parameters';
import './polyfill/webcrypto-shim';
import './polyfill/remove';
import Log from './services/Log';
import Encryption from './services/Encryption';
import { saveAs } from './file-saver';
import Ping from './services/Ping';
import '../css/style.css';
import '../css/alert.css';

const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
let gateway = 'http://localhost:8080/ipfs/';

/**
 *
 * @param {string} msg
 */
function output(msg) {
  const m = document.getElementById('messages');
  m.innerHTML = msg;
}

function downloadFile(fileId, fileName, blob, isEncrypted) {
  const p = new Ping();
  p.ping((err) => {
    if (err) {
      output('Something is blocking the log entry!');
    }
    new Log().createLog(fileId, fileName, false, gateway, isEncrypted);
    saveAs(blob, fileName);
  });
}

function progressBar(percent) {
  const elem = document.getElementById('loadBar');
  elem.style.width = `${percent}%`;
  if (percent >= 100) {
    document.getElementById('loadProgress').style.display = 'none';
  }
}

function load() {
  const password = document.getElementById('passwordField').value;
  const fileId = document.getElementById('firstField').value;
  if (fileId.length !== 46) {
    output('You have entered an invalid filename!');
  } else if (password.length !== 43 && password !== 'nopass') {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9_.-]*$/.test(password)) {
    output('You have entered an invalid password!');
  } else if (!/^[a-zA-Z0-9]*$/.test(fileId)) {
    output('You have entered an invalid filename!');
  } else {
    output('');
    const oReq = new XMLHttpRequest();
    document.getElementById('response').classList.remove('hidden');
    oReq.onloadstart = function onloadstart() {
      document.getElementById('loadProgress').style.display = 'block';
    };
    oReq.onload = function onload() {
      const arrayBuffer = oReq.response;
      const fileNameLength = new TextDecoder('utf-8').decode(arrayBuffer.slice(0, 4)) - 1000;
      const fileName = new TextDecoder('utf-8').decode(
        arrayBuffer.slice(4, fileNameLength + 4),
      );
      // encrypted
      if (password !== 'nopass') {
        const initialVector = new Uint8Array(
          arrayBuffer.slice(4 + fileNameLength, 16 + fileNameLength),
        );
        const fileArray = new Uint8Array(
          arrayBuffer.slice(16 + fileNameLength),
        );
        const enc = new Encryption();
        const keyPromise = enc.importKey(password);
        keyPromise
          .then((key) => {
            const decryptPromise = enc.decrypt(initialVector, key, fileArray);
            decryptPromise
              .then((decrypted) => {
                const typeM = MIME.getType(fileName);
                const blob = new Blob([decrypted], { type: typeM });
                blob.name = fileName;
                downloadFile(fileId, fileName, blob, true);
              })
              .catch(() => {
                output('You have entered an invalid password!');
              });
          })
          .catch(() => {
            output('You have entered an invalid password!');
          });
      } else {
        const fileArray = new Uint8Array(
          arrayBuffer.slice(4 + fileNameLength),
        );
        const typeM = MIME.getType(fileName);
        const blob = new Blob([fileArray], { type: typeM });
        blob.name = fileName;
        downloadFile(fileId, fileName, blob, false);
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

    if (HOST !== 'localhost' && HOST !== '127.0.0.1') {
      gateway = `${PROTOCOL}//${HOST}/ipfs/`;
    }

    oReq.open('GET', gateway + fileId, true);
    oReq.responseType = 'arraybuffer';
    oReq.send();
  }
}

document
  .getElementById('passwordField')
  .addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById('load').click();
    }
  });

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('load').onclick = load;
});
