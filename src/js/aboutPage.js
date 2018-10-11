

import '../css/style.css';
import '../css/tab.css';

function GetURLParameter(sParam) {
  const sPageURL = window.location.search.substring(1);
  const sURLVariables = sPageURL.split('&');
  for (let i = 0; i < sURLVariables.length; i += 1) {
    const sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

window.openCity = function (evt, cityName) {
  console.log('clicked');
  let i; let tabcontent; let
    tablinks;
  tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(cityName).style.display = 'block';
  evt.currentTarget.className += ' active';
};

document.addEventListener('DOMContentLoaded', () => {
  const urlParameter = GetURLParameter('par');
  if (urlParameter == 'terms') {
    document.getElementById('terms').click();
  } else if (urlParameter == 'privacy') {
    document.getElementById('privacy').click();
  } else {
    document.getElementById('defaultOpen').click();
  }
});
