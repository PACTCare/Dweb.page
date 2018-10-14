import Cookie from './services/Cookie';

const agreeCookie = new Cookie('AgreeToTerms');

document.addEventListener('DOMContentLoaded', () => {
  const x = agreeCookie.getCookie();
  if (x !== 'alreadyAgreed') {
    document.getElementById('declineButton').addEventListener('click', () => {
      window.open('https://www.google.com', '_self');
    });
    document.getElementById('agreeButton').addEventListener('click', () => {
      agreeCookie.setCookie('alreadyAgreed', 365);
      document.getElementById('dialog-ovelay').remove();
    });
  } else {
    document.getElementById('dialog-ovelay').remove();
  }
});
