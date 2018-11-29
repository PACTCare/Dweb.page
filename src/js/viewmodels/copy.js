function copy(copyText) {
  const textArea = document.createElement('textarea');
  textArea.value = copyText.textContent;
  textArea.contentEditable = true;
  textArea.readOnly = false;
  document.body.appendChild(textArea);
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    const range = document.createRange();
    range.selectNodeContents(textArea);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    textArea.setSelectionRange(0, 999999);
  } else {
    textArea.select();
  }
  document.execCommand('Copy');
  textArea.parentNode.removeChild(textArea);
}


function copyHash() {
  const copyText = document.getElementById('ipfsHash');
  copy(copyText);
  document.getElementById('notification1').textContent = 'Link copied to clipboard!';
  setTimeout(() => {
    document.getElementById('notification1').textContent = '';
  }, 5000);
}

function copyPassword() {
  const copyText = document.getElementById('password');
  copy(copyText);
  document.getElementById('notification2').textContent = 'Password copied to clipboard!';
  setTimeout(() => {
    document.getElementById('notification2').textContent = '';
  }, 5000);
}

document.getElementById('copyFirstLink').addEventListener('click', copyHash);
document
  .getElementById('copySecondLink')
  .addEventListener('click', copyPassword);
