function autocomplete(inp, arr) {
  let currentFocus;

  function removeActive(x) {
    for (let i = 0; i < x.length; i += 1) {
      x[i].classList.remove('autocomplete-active');
    }
  }

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add('autocomplete-active');
    document.getElementById('firstField').value = x[currentFocus].children[1].value;
  }

  function closeAllLists(elmnt) {
    const x = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < x.length; i += 1) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  inp.addEventListener('input', function inputFunction(e) {
    let b; let i;
    let maxAddedWordCount = 0;
    const val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    const a = document.createElement('DIV');
    a.setAttribute('id', `${this.id}autocomplete-list`);
    a.setAttribute('class', 'autocomplete-items');
    /* append the DIV element as a child of the autocomplete container: */
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i += 1) {
      if (maxAddedWordCount < 8 && arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        maxAddedWordCount += 1;
        b = document.createElement('DIV');
        b.innerHTML = `<strong>${arr[i].substr(0, val.length)}</strong>`;
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += `<input type='hidden' value='${arr[i]}'>`;
        b.addEventListener('click', function valueToInput(e) {
          inp.value = this.getElementsByTagName('input')[0].value;
          closeAllLists();
          document.getElementById('load').click();
        });
        a.appendChild(b);
      }
    }
  });
  inp.addEventListener('keydown', function keydown(e) {
    let x = document.getElementById(`${this.id}autocomplete-list`);
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      currentFocus += 1;
      addActive(x);
    } else if (e.keyCode == 38) { // up
      currentFocus -= 1;
      addActive(x);
    }
  });


  /* execute a function when someone clicks in the document: */
  document.addEventListener('click', (e) => {
    closeAllLists(e.target);
  });
}

const searchTerms = ['Test', 'Bild'];
autocomplete(document.getElementById('firstField'), searchTerms);
