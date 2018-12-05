
import MiniSearch from 'minisearch';
import Iota from '../log/Iota';
import createDayNumber from '../helperFunctions/createDayNumber';
import addMetaData from './addMetaData';
import sortByScoreAndTime from './sortByScoreAndTime';

const storeNames = 'SearchStore';
const request = indexedDB.open('SearchDB', 1);
const STORAGEKEY = 'loadedMetadataNumber';

// first search metadata was stored at day zero
// but the first few days was all about testing
const startDay = 4;

// the bigger maxDaysLoaded the more search data is loaded parallel
// storage should get too big offer time
const maxDaysToLoad = 30;

let db;

window.miniSearch = new MiniSearch({
  idField: 'fileId',
  fields: ['fileName', 'fileType', 'description'],
  searchOptions: {
    boost: { fileName: 2 },
    fuzzy: 0.2,
  },
});

// Todo: improve file types preselection
function fileTypePreselection(val) {
  if (window.searchKind === 'images') {
    return `${val} jpg png`;
  } if (window.searchKind === 'videos') {
    return `${val} mp4 mov`;
  } if (window.searchKind === 'music') {
    return `${val} mp3`;
  }
  return val;
}


/**
 *
 * @param {boolean} databaseWorks
 */
async function updateDatabase(databaseWorks) {
  const iota = new Iota();
  const logFlags = {};

  // returns the highest number!
  const mostRecentDayNumber = createDayNumber();
  let dayNumber = mostRecentDayNumber;
  const awaitTransactions = [];
  let daysLoaded = window.localStorage.getItem(STORAGEKEY);

  // first time user
  if (daysLoaded === null) {
    if (mostRecentDayNumber + startDay > maxDaysToLoad) {
      daysLoaded = mostRecentDayNumber - maxDaysToLoad; // load the max number of days
    } else {
      daysLoaded = startDay;
    }
  } else if (mostRecentDayNumber - daysLoaded > maxDaysToLoad) {
    // means the last time the page was open is quite some time ago
    daysLoaded = mostRecentDayNumber - maxDaysToLoad;
  }

  while (dayNumber >= daysLoaded) {
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
      if (databaseWorks) {
        const tx = db.transaction([storeNames], 'readwrite');
        const store = tx.objectStore(storeNames);
        const countRequest = store.count(logObj.fileId);
        countRequest.onsuccess = function checkExistens() {
          if (countRequest.result === 0) {
            tx.objectStore(storeNames).put(logObj, logObj.fileId);
            // if it's new immidiatly update search engine
            addMetaData(logObj);
          }
        };
      } else {
        addMetaData(logObj);
      }
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
    window.miniSearch.addAll(window.metadata);
    updateDatabase(true);
  };
};

request.onerror = function databaseError(e) {
  console.log('SearchDB error - Private mode');
  window.metadata = [];
  updateDatabase(false);
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
    let val = this.value;
    closeAllLists();
    if (!val) {
      document.getElementById('currentSelectedHiddenHash').innerText = 'nix';
      return false;
    }
    val = fileTypePreselection(val);
    const searchResults = window.miniSearch.search(val.replace('.', ' '));
    const searchItems = [];
    for (let j = 0; j < searchResults.length; j += 1) {
      const item = window.metadata.find(o => o.fileId === searchResults[j].id);
      item.score = searchResults[j].score;

      // improve file types actual selection
      if (window.searchKind === 'images') {
        const imageTypes = ['png', 'jpg', 'jpeg'];
        if (imageTypes.indexOf(item.fileType) > -1) {
          searchItems.push(item);
        }
      } else if (window.searchKind === 'videos') {
        const imageTypes = ['mp4'];
        if (imageTypes.indexOf(item.fileType) > -1) {
          searchItems.push(item);
        }
      } else if (window.searchKind === 'music') {
        const imageTypes = ['mp3'];
        if (imageTypes.indexOf(item.fileType) > -1) {
          searchItems.push(item);
        }
      } else {
        searchItems.push(item);
      }
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
