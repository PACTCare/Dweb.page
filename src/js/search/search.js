
import MiniSearch from 'minisearch';
import Iota from '../log/Iota';
import createDayNumber from '../helperFunctions/createDayNumber';
import addMetaData from './addMetaData';
import sortByScoreAndTime from './sortByScoreAndTime';

const storeNames = 'SearchStore';
const request = indexedDB.open('SearchDB', 1);
const STORAGEKEY = 'loadedMetadataNumber';

// first search metadata was stored at day zero
// the lower the number the more search data is loaded
// later change to x days befor current day
const STARTNUMBER = 4;
let db;

async function updateDatabase() {
  const iota = new Iota();
  const logFlags = {};
  let nrSofar = window.localStorage.getItem(STORAGEKEY);
  if (nrSofar === null) {
    nrSofar = STARTNUMBER;
  }
  // returns the highest number!
  const mostRecentDayNumber = createDayNumber();
  let dayNumber = mostRecentDayNumber;
  const awaitTransactions = [];
  while (dayNumber >= nrSofar) {
    const dayTag = iota.createTimeTag(dayNumber);
    awaitTransactions.push(iota.getTransactionByTag(`DWEBPUU${dayTag}`));
    dayNumber -= 1;
  }
  const transactionsArrays = await Promise.all(awaitTransactions); // array of arrays!
  const transactions = [].concat(...transactionsArrays);
  transactions.map(async (transaction) => {
    const logObj = await iota.getLog(transaction);
    if (!logFlags[logObj.fileId]) {
      logFlags[logObj.fileId] = true;
      const tx = db.transaction([storeNames], 'readwrite');
      const store = tx.objectStore(storeNames);
      const countRequest = store.count(logObj.fileId);
      countRequest.onsuccess = function checkExistens() {
        if (countRequest.result === 0) {
          tx.objectStore(storeNames).put(logObj, logObj.fileId);
          // if it's new immidiatly update search engine
          addMetaData(logObj.fileId, logObj.fileName, logObj.fileType, logObj.description, logObj.time, logObj.gateway);
        }
      };
    }
  });
  window.localStorage.setItem(STORAGEKEY, mostRecentDayNumber.toString());
}

request.onupgradeneeded = function databaseUpgrade(e) {
  const dbLocal = e.target.result;
  dbLocal.createObjectStore(storeNames);
};

request.onsuccess = async function startSearch(event) {
  db = event.target.result;
  const tx = db.transaction([storeNames]);
  const metadataTx = tx.objectStore(storeNames).getAll();
  metadataTx.onsuccess = function addMetaDataToSearch() {
    window.metadata = metadataTx.result;
    window.miniSearch = new MiniSearch({
      idField: 'fileId',
      fields: ['fileName', 'fileType', 'description'],
      searchOptions: {
        boost: { fileName: 2 },
        fuzzy: 0.2,
      },
    });
    window.miniSearch.addAll(window.metadata);
    updateDatabase();
  };
};

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
    document.getElementById('firstField').value = x[currentFocus].children[3].value;
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
    const searchResults = window.miniSearch.search(val.replace('.', ' '));
    const searchItems = [];
    for (let i = 0; i < searchResults.length; i += 1) {
      const item = window.metadata.find(o => o.fileId === searchResults[i].id);
      item.score = searchResults[i].score;
      searchItems.push(item);
    }
    searchItems.sort(sortByScoreAndTime);
    currentFocus = -1;
    const a = document.createElement('DIV');
    a.setAttribute('id', `${this.id}autocomplete-list`);
    a.setAttribute('class', 'autocomplete-items');
    this.parentNode.appendChild(a);
    for (i = 0; i < searchItems.length; i += 1) {
      if (maxAddedWordCount < 6) {
        if (maxAddedWordCount === 0) {
          document.getElementById('currentSelectedHiddenHash').innerText = searchItems[i].fileId;
        }
        maxAddedWordCount += 1;
        b = document.createElement('DIV');
        b.innerHTML = `<span style='color:#db3e4d'>[${searchItems[i].fileType}]</span> <strong>${capFirstLetter(searchItems[i].fileName)}</strong> <span style='font-size: 12px;'>${searchItems[i].time}<br>${searchItems[i].fileId}</span>`;
        b.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}'>`;
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
