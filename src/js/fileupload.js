import Cookie from './services/Cookie';

const checkBoxCookie = new Cookie('Checkbox');

function supportsFileread() {
  return window.File && window.FileList && window.FileReader;
}

const checkbox = document.getElementById('endToEndCheck');

checkbox.addEventListener('change', function checkBox() {
  if (this.checked) {
    document.getElementById('checkboxText').innerText = 'Private';
    checkBoxCookie.setCookie('on', 365);
  } else {
    document.getElementById('checkboxText').innerText = 'Public';
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
    document.getElementById('messages').innerHTML = msg;
  }

  function parseFile(file) {
    output(`<strong>${encodeURI(file.name)}</strong>`);
    document.getElementById('passwordDiv').style.display = 'none';
    document.getElementById('start').style.display = 'none';
    document.getElementById('response').style.display = 'block';
    const imageName = file.name;
    const isImage = /\.(?=gif|jpg|png|jpeg)/gi.test(imageName);
    if (isImage) {
      document.getElementById('file-image').style.display = 'inline-block';
      document.getElementById('file-image').src = URL.createObjectURL(file);
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
      document.getElementById('checkboxText').innerText = 'Private';
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
