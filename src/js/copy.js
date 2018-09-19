document.getElementById("copyFirstLink").addEventListener("click", copyHash);
document
  .getElementById("copySecondLink")
  .addEventListener("click", copyPassword);

function copyHash() {
  var copyText = document.getElementById("ipfsHash");
  copy(copyText);
  document.getElementById("notification1").innerHTML =
    "Link copied to clipboard!";
  setTimeout(function() {
    document.getElementById("notification1").innerHTML = "";
  }, 5000);
}

function copyPassword() {
  var copyText = document.getElementById("password");
  copy(copyText);
  document.getElementById("notification2").innerHTML =
    "Password copied to clipboard!";
  setTimeout(function() {
    document.getElementById("notification2").innerHTML = "";
  }, 5000);
}

function copy(copyText) {
  var textArea = document.createElement("textarea");
  textArea.value = copyText.textContent;
  textArea.contentEditable = true;
  textArea.readOnly = false;
  document.body.appendChild(textArea);
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    var range = document.createRange();
    range.selectNodeContents(textArea);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    textArea.setSelectionRange(0, 999999);
  } else {
    textArea.select();
  }
  document.execCommand("Copy");
  textArea.remove();
}
