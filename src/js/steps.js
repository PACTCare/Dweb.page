let currentTab = 0;

function validateForm() {
  // This function deals with validation of the form fields
  let i;
  let valid = true;
  const x = document.getElementsByClassName('tabSteps');
  const y = x[currentTab].getElementsByTagName('input');
  for (i = 0; i < y.length; i += 1) {
    if (y[i].value === '') {
      y[i].className += ' invalid';
      valid = false;
    }
  }

  return valid;
}

function fixStepIndicator(n) {
  let i;
  const x = document.getElementsByClassName('step');
  for (i = 0; i < x.length; i += 1) {
    x[i].className = x[i].className.replace(' active', '');
  }
  x[n].className += ' active';
}

function showTab(n) {
  const x = document.getElementsByClassName('tabSteps');
  for (let i = 0; i < x.length; i += 1) {
    if (i === n) {
      x[i].style.display = 'block';
    } else {
      x[i].style.display = 'none';
    }
  }
  // ... and fix the Previous/Next buttons:
  if (n === 0) {
    document.getElementById('prevBtn').style.display = 'none';
  } else {
    document.getElementById('prevBtn').style.display = 'inline';
  }
  if (n === x.length - 1) {
    document.getElementById('newUpload').style.display = 'inline';
    document.getElementById('nextBtn').style.display = 'none';
    document
      .getElementById('nextAtEnd')
      .setAttribute('style', 'display:inline !important');
  } else {
    document.getElementById('newUpload').style.display = 'none';
    document.getElementById('nextBtn').innerHTML = 'Next';
    document.getElementById('nextBtn').style.display = 'inline';
  }
  // ... and run a function that will display the correct step indicator:
  fixStepIndicator(n);
}

showTab(currentTab);

window.nextPrev = function nextPrev(n) {
  const x = document.getElementsByClassName('tabSteps');
  // Exit the function if any field in the current tab is invalid:
  if (n === 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = 'none';
  // Increase or decrease the current tab by 1:
  currentTab += n;
  // Otherwise, display the correct tab:
  showTab(currentTab);
};

document.getElementById('toIndex').addEventListener('click', () => {
  currentTab = 0;
  showTab(currentTab);
});

document.getElementById('newUpload').addEventListener('click', () => {
  currentTab = 0;
  showTab(currentTab);
});
