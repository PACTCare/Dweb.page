import '../css/tab.css';

window.openCity = function openCity(evt, cityName) {
  let i;
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i += 1) {
    tabcontent[i].style.display = 'none';
  }
  const tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i += 1) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(cityName).style.display = 'block';
  evt.currentTarget.className += ' active';
};
