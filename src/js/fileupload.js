import Cookie from './services/Cookie';

const fileSizeLimit = 1000; // In MB
const checkBoxCookie = new Cookie('Checkbox');

function supportsFileread() {
  return window.File && window.FileList && window.FileReader;
}

const checkbox = document.getElementById('endToEndCheck');

checkbox.addEventListener('change', function checkBox() {
  if (this.checked) {
    document.getElementById('checkboxText').innerText = 'On';
    checkBoxCookie.setCookie('on', 365);
  } else {
    document.getElementById('checkboxText').innerText = 'Off';
    checkBoxCookie.setCookie('off', 365);
  }
});

function ekUpload() {
  function fileDragHover(e) {
    const fileDrag = document.getElementById('file-drag');
    e.stopPropagation();
    e.preventDefault();
    fileDrag.className = e.type === 'dragover' ? 'hover' : 'modal-body file-upload';
  }

  function output(msg) {
    const m = document.getElementById('messages');
    m.innerHTML = msg;
  }

  function parseFile(file) {
    output(`<strong>${encodeURI(file.name)}</strong>`);
    document.getElementsByClassName('switch')[0].style.display = 'none';
    document.getElementById('checkboxText').style.display = 'none';
    document.getElementById('passwordProtected').style.display = 'none';
    document.getElementById('start').classList.add('hidden');
    document.getElementById('response').classList.remove('hidden');
    const imageName = file.name;
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(imageName);
    if (isImage) {
      document.getElementById('file-image').classList.remove('hidden');
      document.getElementById('file-image').src = URL.createObjectURL(file);
    }
    if (file.size > fileSizeLimit * 1024 * 1024) {
      output(`Please upload a smaller file (< ${fileSizeLimit} MB).`);
      document.getElementById('loadingAnimation').style.display = 'none';
    }
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
    if (checkboxCookie !== 'off') {
      document.getElementById('endToEndCheck').checked = true;
      document.getElementById('checkboxText').innerText = 'On';
    }
    const fileSelect = document.getElementById('file-upload');


    const fileDrag = document.getElementById('file-drag');

    fileSelect.addEventListener('change', fileSelectHandler, false);

    // Is XHR2 available?
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
