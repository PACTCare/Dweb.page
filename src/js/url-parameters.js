// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function GetURLParameter(sParam) {
  const sPageURL = window.location.search.substring(1);
  const sURLVariables = sPageURL.split('&');
  for (let i = 0; i < sURLVariables.length; i++) {
    const sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const filename = GetURLParameter('id');
  // nopass equals unencrypted
  const password = GetURLParameter('password');
  if (typeof filename !== 'undefined') {
    document.getElementById('firstField').value = filename;
    document.getElementById('firstField').style.display = 'none';
  }
  if (typeof password !== 'undefined') {
    document.getElementById('passwordField').value = password;
    if (password === 'nopass') {
      document.getElementById('hideSpace1').style.display = 'none';
      document.getElementById('hideSpace2').style.display = 'none';
    }
    document.getElementById('passwordField').style.display = 'none';
  }
});
