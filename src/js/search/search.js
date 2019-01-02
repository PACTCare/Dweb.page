import MiniSearch from 'minisearch';
import Iota from '../iota/Iota';
import FileType from '../services/FileType';
import createDayNumber from '../helperFunctions/createDayNumber';
import addMetaData from './addMetaData';
import sortByScoreAndTime from './sortByScoreAndTime';
import searchDb from './searchDb';
import Signature from '../crypto/Signature';
import prepObjectForSignature from '../crypto/prepObjectForSignature';
import daysToLoadNr from './dayToLoadNr';
import prepSearchText from './prepSearchText';

// Max length Array
const maxArrayLength = 1000;

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
    return `${val} jpg png gif svg bmp webp tiff`;
  } if (window.searchKind === 'videos') {
    return `${val} mp4 mov flv avi wmv webm`;
  } if (window.searchKind === 'music') {
    return `${val} mp3 wma wav ogg acc flac`;
  }
  return val;
}

/**
 * Load most recent database entries
 * @param {boolean} databaseWorks
 */
async function updateDatabase(databaseWorks) {
  const iota = new Iota();
  await iota.nodeInitialization();
  const sig = new Signature();
  const logFlags = {};

  // returns the highest number!
  const mostRecentDayNumber = createDayNumber();
  const awaitTransactions = [];
  let firstTime = false;
  let recentDaysLoaded = 0;
  let maxRecentDayLoad = 1;

  // Don't load block subscriptions
  const subscribeArray = await searchDb.subscription.where('blocked').equals(0).toArray();
  if (subscribeArray.length === 0) {
    firstTime = true;
    maxRecentDayLoad = 10;
  }

  let dayNumber = mostRecentDayNumber;
  if (!firstTime) {
    for (let i = 0; i < subscribeArray.length; i += 1) {
      const daysLoaded = daysToLoadNr(subscribeArray[i].daysLoaded);
      while (dayNumber >= daysLoaded) {
        const tag = iota.createTimeTag(dayNumber);
        console.log(tag);
        awaitTransactions.push(iota.getTransactionByAddressAndTag(subscribeArray[i].address, tag));
        recentDaysLoaded += 1;
        dayNumber -= 1;
      }
    }
  }

  dayNumber = mostRecentDayNumber;
  recentDaysLoaded = 0;
  while (dayNumber >= 0 && recentDaysLoaded < maxRecentDayLoad) {
    const tag = iota.createTimeTag(dayNumber);
    awaitTransactions.push(iota.getTransactionByTag(tag));
    recentDaysLoaded += 1;
    dayNumber -= 1;
  }

  const transactionsArrays = await Promise.all(awaitTransactions);
  let transactions = [].concat(...transactionsArrays);
  transactions = transactions.slice(0, maxArrayLength);
  transactions.map(async (transaction) => {
    let metaObject = await iota.getMessage(transaction);
    if (!logFlags[metaObject.fileId]) {
      logFlags[metaObject.fileId] = true;
      metaObject.publicTryteKey = metaObject.address + metaObject.publicTryteKey;
      const publicKey = await sig.importPublicKey(iota.tryteKeyToHex(metaObject.publicTryteKey));
      const { signature, address } = metaObject;
      metaObject = prepObjectForSignature(metaObject);
      const isVerified = await sig.verify(publicKey, signature, JSON.stringify(metaObject));
      metaObject.address = address;
      if (isVerified) {
        if (databaseWorks) {
          const metadata = await searchDb.metadata.get({ fileId: metaObject.fileId });
          if (typeof metadata === 'undefined') {
            await searchDb.metadata.add(metaObject);
            addMetaData(metaObject);
          }
        } else {
          addMetaData(metaObject);
        }
      }
    }
  });

  // update most recent day for all subscribers
  await searchDb.subscription.where('daysLoaded').aboveOrEqual(0).modify({ daysLoaded: mostRecentDayNumber });
}

async function startSearch() {
  try {
    window.metadata = await searchDb.metadata.toArray();
    window.miniSearch.addAll(window.metadata);
    updateDatabase(true);
  } catch (err) {
    window.metadata = [];
    updateDatabase(true);
  }
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

  inp.addEventListener('input', async function inputFunction() {
    let b; let i;
    let maxAddedWordCount = 0;
    let val = this.value;
    closeAllLists();
    if (!val) {
      window.searchSelection = { fileId: 'na', subscribeAddress: 'na' };
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
        if (FileType.imageTypes().indexOf(item.fileType.toLowerCase()) > -1) {
          searchItems.push(item);
        }
      } else if (window.searchKind === 'videos') {
        if (FileType.videoTypes().indexOf(item.fileType.toLowerCase()) > -1) {
          searchItems.push(item);
        }
      } else if (window.searchKind === 'music') {
        if (FileType.musicTypes().indexOf(item.fileType.toLowerCase()) > -1) {
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
          window.searchSelection = searchItems[i];
        }
        maxAddedWordCount += 1;

        const timeArray = searchItems[i].time.split(' ');
        const timeString = `${timeArray[0]} ${timeArray[1]} ${timeArray[2]} ${timeArray[3]}`;
        b = document.createElement('DIV');
        const span = document.createElement('SPAN');
        const icon = FileType.returnFileIcon(searchItems[i].fileType);
        span.innerHTML = `<strong>${icon} ${prepSearchText(searchItems[i].fileName, 60)}</strong> `;
        span.innerHTML += `<span style='font-size: 12px;'><br>${prepSearchText(searchItems[i].description, 140)}<br>${searchItems[i].fileId} - ${timeString}</span>`;
        span.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}'>`;
        span.addEventListener('click', function valueToInput() {
          inp.value = this.getElementsByTagName('input')[0].value;
          closeAllLists();
          document.getElementById('searchload').click();
        });
        b.appendChild(span);
        const spanTwo = document.createElement('SPAN');
        spanTwo.innerHTML = '<i class="fas fa-ban"></i>';
        spanTwo.style.cssFloat = 'right';
        spanTwo.style.color = '#db3e4d';
        const { address } = searchItems[i];
        // eslint-disable-next-line no-loop-func
        spanTwo.addEventListener('click', async () => {
          console.log('ban click');
          // TODO: entries need to be removed from metadata as well as don't load additional meta from this subscriber
          // window.metadata
          // window.miniSearch
          await searchDb.subscription.where('address').equals(address).modify({ blocked: 1 }); // 1 = true
          await searchDb.metadata.where('address').equals(address).delete();
        });
        b.appendChild(spanTwo);
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

startSearch();
