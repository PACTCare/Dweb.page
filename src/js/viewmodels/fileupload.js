import Cookie from '../services/Cookie';
import startIPFS from '../ipfs/startIPFS';
import { GATEWAY } from '../ipfs/ipfsConfig';

const checkBoxCookie = new Cookie('Checkbox');

function supportsFileread() {
  return window.File && window.FileList && window.FileReader;
}

const checkbox = document.getElementById('endToEndCheck');

function removeChildren(myNode) {
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

function publicLayout() {
  document.getElementById('checkboxText').textContent = 'Public';
  document.getElementById('start').style.color = '#db3e4d';
  const icon = document.createElement('i');
  icon.style.fontSize = '50px';
  icon.style.marginBottom = '1rem';
  icon.className = 'fas fa-file-upload';
  document.getElementById('start').appendChild(icon);
  const div = document.createElement('div');
  div.id = 'addFileText';
  if (GATEWAY.includes('localhost') || GATEWAY.includes('127.0.0.1')) {
    div.innerHTML = 'Add File(s) for Public Dweb Sharing';
  } else {
    div.innerHTML = 'Add File(s) for Public Dweb Sharing<br> <span id="limitText">Up to 1GB</span>';
  }
  document.getElementById('start').appendChild(div);
}

function privateLayout() {
  document.getElementById('checkboxText').textContent = 'Private';
  document.getElementById('start').style.color = '#3157a7';
  const icon = document.createElement('i');
  icon.style.fontSize = '50px';
  icon.style.marginBottom = '1rem';
  icon.className = 'fas fa-shield-alt';
  document.getElementById('start').appendChild(icon);
  const div = document.createElement('div');
  div.id = 'addFileText';
  if (GATEWAY.includes('localhost') || GATEWAY.includes('127.0.0.1')) {
    div.innerHTML = 'Add File(s) for Private Dweb Sharing';
  } else {
    div.innerHTML = 'Add File(s) for Private Dweb Sharing<br> <span id="limitText">Up to 1GB</span>';
  }
  document.getElementById('start').appendChild(div);
}

checkbox.addEventListener('change', function checkBox() {
  removeChildren(document.getElementById('start'));
  if (this.checked) {
    checkBoxCookie.setCookie('on', 365);
    privateLayout();
  } else {
    checkBoxCookie.setCookie('off', 365);
    publicLayout();
  }
});

async function ekUpload() {
  // TODO: resolve createMedata, createLog, filePage, loadMetadata
  startIPFS();

  function fileDragHover(e) {
    const fileDrag = document.getElementById('file-drag');
    e.stopPropagation();
    e.preventDefault();
    fileDrag.className = e.type === 'dragover' ? 'hover' : 'modal-body file-upload';
  }

  function output(msg) {
    document.getElementById('messages').innerHTML = msg;
  }

  function parseFile(file) {
    output(`<strong>${encodeURI(file.name)}</strong>`);
    document.getElementById('passwordDiv').style.display = 'none';
    document.getElementById('start').style.display = 'none';
    document.getElementById('response').style.display = 'block';
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(file.name);
    if (isImage) {
      document.getElementById('file-image').style.display = 'inline-block';
      document.getElementById('file-image').src = URL.createObjectURL(file);
    }
    // Todo show for other file types
  }

  function fileSelectHandler(e) {
    const files = e.target.files || e.dataTransfer.files;
    fileDragHover(e);
    for (var i = 0, f; (f = files[i]); i += 1) {
      parseFile(f);
    }
  }

  function Init() {
    const checkboxCookie = checkBoxCookie.getCookie();
    if (checkboxCookie === 'on') {
      document.getElementById('endToEndCheck').checked = true;
      privateLayout();
    } else {
      publicLayout();
    }
    const fileSelect = document.getElementById('file-upload');
    const fileDrag = document.getElementById('file-drag');
    fileSelect.addEventListener('change', fileSelectHandler, false);
    const xhr = new XMLHttpRequest();
    if (xhr.upload) {
      // File Drop
      fileDrag.addEventListener('dragover', fileDragHover, false);
      fileDrag.addEventListener('dragleave', fileDragHover, false);
      fileDrag.addEventListener('drop', fileSelectHandler, false);
    }
  }

  // supportsCrypto() &&
  if (supportsFileread()) {
    Init();
  } else {
    document.getElementById('file-drag').style.display = 'none';
    document
      .getElementById('notSupported')
      .setAttribute('style', 'display:block !important');
  }
}
ekUpload();
