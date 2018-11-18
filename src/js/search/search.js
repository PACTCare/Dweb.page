import LUNR from 'lunr';
import Iota from '../log/Iota';

const storeNames = 'SearchStore';
const request = indexedDB.open('SearchDB', 1);

const iotaLogArray = [];
let idx;

async function startLunr() {
  const iota = new Iota();
  const time = new Date().toUTCString();
  const timeTag = iota.createTimeTag(time);
  const logFlags = {};
  console.time('load');
  const transactions = await iota.getTransactionByTag(`PACTPUU${timeTag}`);
  await Promise.all(
    transactions.map(async (transaction) => {
      const logObj = await iota.getLog(transaction);
      if (!logFlags[logObj.fileId]) {
        logFlags[logObj.fileId] = true;
        iotaLogArray.push(logObj);
      }
    }),
  );
  console.timeEnd('load');
  idx = LUNR(async function index() {
    this.ref('id');
    this.field('fileName'); // , { boost: 10 }
    this.field('fileType');
    this.field('fileId');
    this.field('description');

    for (let i = 0; i < iotaLogArray.length; i += 1) {
      this.add({
        id: i,
        fileName: iotaLogArray[i].fileName,
        fileType: iotaLogArray[i].fileType,
        fileId: iotaLogArray[i].fileId,
        description: iotaLogArray[i].description,
      });
    }
  });
}

function capFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function autocomplete(inp) {
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
    document.getElementById('firstField').value = x[currentFocus].children[2].value;
  }

  function closeAllLists(elmnt) {
    const x = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < x.length; i += 1) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }


  inp.addEventListener('input', async function inputFunction(e) {
    let b; let i;
    let maxAddedWordCount = 0;
    const val = this.value;
    closeAllLists();
    if (!val) {
      document.getElementById('currentSelectedHiddenHash').innerText = 'nix';
      return false;
    }
    const searchResults = idx.search(val.replace('.', ' '));
    currentFocus = -1;
    const a = document.createElement('DIV');
    a.setAttribute('id', `${this.id}autocomplete-list`);
    a.setAttribute('class', 'autocomplete-items');
    /* append the DIV element as a child of the autocomplete container: */
    this.parentNode.appendChild(a);
    for (i = 0; i < searchResults.length; i += 1) {
      if (maxAddedWordCount < 6) {
        const item = iotaLogArray[searchResults[i].ref];
        if (maxAddedWordCount === 0) {
          document.getElementById('currentSelectedHiddenHash').innerText = item.fileId;
        }
        maxAddedWordCount += 1;
        b = document.createElement('DIV');
        b.innerHTML = `[${item.fileType}] <strong>${capFirstLetter(item.fileName)}</strong> <span style='font-size: 12px;'>${item.time}<br>${item.fileId}</span>`;
        b.innerHTML += `<input type='hidden' value='${item.fileId}'>`;
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
    if (e.keyCode === 40) {
      currentFocus += 1;
      addActive(x);
    } else if (e.keyCode === 38) { // up
      currentFocus -= 1;
      addActive(x);
    }
  });

  document.addEventListener('click', (e) => {
    closeAllLists(e.target);
  });
}

autocomplete(document.getElementById('firstField'));
startLunr();
