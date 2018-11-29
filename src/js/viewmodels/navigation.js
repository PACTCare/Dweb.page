import getURLParameter from '../helperFunctions/urlParameter';

function menuAnimation(inputId) {
  // reset upload page, receive etc.
  document.getElementById('show-menu').checked = false;
  const ids = ['receivePage', 'historyPage', 'index', 'aboutPage'];
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i] === inputId) {
      document.getElementById(ids[i]).style.transition = 'visibility 0.2s,transform 0.2s, opacity 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)';
      document.getElementById(ids[i]).style.visibility = 'visible';
      document.getElementById(ids[i]).style.height = '100%';
      document.getElementById(ids[i]).style.width = '100%';
      document.getElementById(ids[i]).style.transform = 'scale(1)';
      document.getElementById(ids[i]).style.opacity = '1';
    } else {
      document.getElementById(ids[i]).style.transition = 'none';
      document.getElementById(ids[i]).style.visibility = 'hidden';
      document.getElementById(ids[i]).style.height = '0%';
      document.getElementById(ids[i]).style.width = '0%';
      document.getElementById(ids[i]).style.transform = 'scale(0.9)';
      document.getElementById(ids[i]).style.opacity = '0%';
    }
  }
}

function isIE() {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE '); // IE 10 or older
  const trident = ua.indexOf('Trident/'); // IE 11
  return (msie > 0 || trident > 0);
}

function indexInit() {
  document.getElementById('nextAtEnd').style.display = 'none';
  document.getElementById('fileLink').textContent = 'File Link > ';
  document.getElementById('passwordDiv').style.display = 'block';
  document.getElementById('passwordStep').textContent = 'Password > ';
  document.getElementById('passwordStep').style.display = 'inline-block';
  document.getElementById('fileLinkHeadline').textContent = 'Step 1: Share File Link';
  document.getElementById('secondStepHeadline').textContent = 'Step 2: Share Password';
  document.getElementById('doneHeadline').textContent = 'Step 3: Done';
  document.getElementById('fileAvailable').innerHTML = 'Your file is available for 3 days.<br> You can find your sharing history <a onclick="openHistory()" style="color: #6d91c7;cursor: pointer;">here</a>.';
  document.getElementById('file-upload-form').style.display = 'block';
  document.getElementById('headline').style.display = 'block';
  document.getElementById('afterUpload').style.display = 'none';
  document.getElementById('adDoFrame').style.display = 'none';
  document.getElementById('start').style.display = 'block';
  document.getElementById('response').style.display = 'none';
  document.getElementById('file-image').style.display = 'none';
  document.getElementById('file-upload').value = '';
  document.getElementById('stepsDiv').style.display = 'block';
  document.getElementById('fileTab').classList.add('tabSteps');
  document.getElementById('fileTab').style.display = 'block';
  document.getElementById('passwordTab').classList.add('tabSteps');
  document.getElementById('passwordStep').classList.add('step');
  document.getElementById('lastTab').style.display = 'none';
  document.getElementById('newUpload').style.display = 'none';
}

function receiveInit() {
  document
    .getElementById('firstField')
    .addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById('load').click();
      }
    });
  document.getElementById('messagesReceivePage').textContent = '';
  document.getElementById('searchHeadline').textContent = 'Search';
  document.getElementById('currentSelectedHiddenHash').textContent = 'nix';
  document.getElementById('firstField').style.display = 'block';
  document.getElementById('receiveResponse').style.display = 'none';
  document.getElementById('firstField').value = '';
  document.getElementById('passwordField').style.display = 'none';
  document.getElementById('searchHeadline').style.marginBottom = '1.5rem';
  window.history.replaceState(null, null, window.location.pathname);
}

function linkInit() {
  document.getElementById('searchHeadline').textContent = 'Receive File';
  document.getElementById('firstField').style.display = 'none';
  document.getElementById('receiveResponse').style.display = 'none';
  document.getElementById('searchHeadline').style.marginBottom = '0rem';
}

function aboutInit() {
  document.getElementById('defaultOpen').click();
}

function currentPage(inputId) {
  const ids = ['toIndex', 'toReceive', 'toHistory', 'toAbout'];
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i] === inputId) {
      document.getElementById(ids[i]).classList.add('currentPage');
      if (ids[i] === 'toReceive') {
        receiveInit();
        if (!isIE()) {
          window.setTimeout(() => {
            document.getElementById('firstField').focus();
          }, 100);
        }
      } else if (ids[i] === 'toIndex') {
        indexInit();
      } else if (ids[i] === 'toAbout') {
        aboutInit();
      }
    } else {
      document.getElementById(ids[i]).classList.remove('currentPage');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialization
  indexInit();
  const urlParameter = getURLParameter('par');
  const fileIdPar = getURLParameter('id');
  const passwordPar = getURLParameter('password');
  if (urlParameter === 'terms' || urlParameter === 'privacy') {
    document.getElementById('dialog-ovelay').style.display = 'none';
    menuAnimation('aboutPage');
    currentPage('toAbout');
    if (urlParameter === 'terms') {
      document.getElementById('terms').click();
    } else if (urlParameter === 'privacy') {
      document.getElementById('privacy').click();
    }
  } else if (typeof fileIdPar !== 'undefined') {
    menuAnimation('receivePage');
    currentPage('');
    linkInit();
    document.getElementById('firstField').value = fileIdPar;
    if (typeof passwordPar !== 'undefined') {
      document.getElementById('passwordField').value = passwordPar;
      document.getElementById('passwordField').style.display = 'none';
    } else {
      document.getElementById('passwordField').style.display = 'block';
      if (!isIE()) { document.getElementById('passwordField').focus(); }
      document
        .getElementById('passwordField')
        .addEventListener('keyup', (event) => {
          event.preventDefault();
          if (event.keyCode === 13) {
            document.getElementById('load').click();
          }
        });
    }
  } else {
    document.getElementById('toIndex').classList.add('currentPage');
  }
});

window.openHistory = function openHistory() {
  menuAnimation('historyPage');
  currentPage('toHistory');
};

document.getElementById('toIndex').addEventListener('click', () => {
  menuAnimation('index');
  currentPage('toIndex');
});

document.getElementById('newUpload').addEventListener('click', () => {
  menuAnimation('index');
  currentPage('toIndex');
});

document.getElementById('toReceive').addEventListener('click', () => {
  menuAnimation('receivePage');
  currentPage('toReceive');
});
document.getElementById('toHistory').addEventListener('click', () => {
  window.openHistory();
});
document.getElementById('toAbout').addEventListener('click', () => {
  menuAnimation('aboutPage');
  currentPage('toAbout');
});
