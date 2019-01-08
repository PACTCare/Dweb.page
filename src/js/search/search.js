import MiniSearch from 'minisearch';
import Iota from '../iota/Iota';
import FileType from '../services/FileType';
import createDayNumber from '../helperFunctions/createDayNumber';
import addMetaData from './addMetaData';
import removeMetaData from './removeMetaData';
import sortByScoreAndTime from './sortByScoreAndTime';
import searchDb from './searchDb';
import Signature from '../crypto/Signature';
import prepObjectForSignature from '../crypto/prepObjectForSignature';
import daysToLoadNr from './dayToLoadNr';
import prepSearchText from './prepSearchText';
import Subscription from './Subscription';
import {
  UNAVAILABLE_DESC, MAX_LOAD_DAYS, MAX_LOAD_ARRAY, DEFAULT_DESCRIPTION,
} from './searchConfig';

const subscription = new Subscription();

window.miniSearch = new MiniSearch({
  idField: 'fileId',
  fields: ['fileName', 'fileType', 'description'],
  searchOptions: {
    boost: { fileName: 2 },
    fuzzy: 0.2,
  },
});

// TODO: improve file types preselection
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

function inputValToWinDowSearchSelection(inputVal) {
  window.searchSelection = {
    fileId: inputVal.split('=')[0],
    fileName: inputVal.split('=')[1],
    fileType: inputVal.split('=')[2],
    address: inputVal.split('=')[3],
  };
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
  let dayNumber = mostRecentDayNumber;
  const awaitTransactions = [];
  let firstTime = false;
  let recentDaysLoaded = 0;
  let maxRecentDayLoad = 1;

  if (databaseWorks) {
    const subscribeArray = await subscription.loadActiveSubscription();
    if (subscribeArray.length === 0) {
      firstTime = true;
      maxRecentDayLoad = MAX_LOAD_DAYS;
    }

    if (!firstTime) {
      for (let i = 0; i < subscribeArray.length; i += 1) {
        const daysLoaded = daysToLoadNr(subscribeArray[i].daysLoaded);
        while (dayNumber >= daysLoaded) {
          const tag = iota.createTimeTag(dayNumber);
          awaitTransactions.push(
            iota.getTransactionByAddressAndTag(subscribeArray[i].address, tag),
          );
          recentDaysLoaded += 1;
          dayNumber -= 1;
        }
      }
    } else {
      maxRecentDayLoad = MAX_LOAD_DAYS;
    }

    dayNumber = mostRecentDayNumber;
    recentDaysLoaded = 0;
    while (dayNumber >= 0 && recentDaysLoaded < maxRecentDayLoad) {
      const tag = iota.createTimeTag(dayNumber);
      console.log(tag);
      awaitTransactions.push(iota.getTransactionByTag(tag));
      recentDaysLoaded += 1;
      dayNumber -= 1;
    }

    const transactionsArrays = await Promise.all(awaitTransactions);
    let transactions = [].concat(...transactionsArrays);
    transactions = transactions.slice(0, MAX_LOAD_ARRAY);
    transactions.map(async (transaction) => {
      let metaObject = await iota.getMessage(transaction);

      // Unavailable data needs to be loaded even if the file id already exists
      if (!logFlags[metaObject.fileId] || metaObject.description === UNAVAILABLE_DESC) {
        logFlags[metaObject.fileId] = true;
        metaObject.publicTryteKey = metaObject.address + metaObject.publicTryteKey;
        const publicKey = await sig.importPublicKey(iota.tryteKeyToHex(metaObject.publicTryteKey));
        if (typeof publicKey !== 'undefined') {
          const { signature, address } = metaObject;
          metaObject = prepObjectForSignature(metaObject);
          const isVerified = await sig.verify(publicKey, signature, JSON.stringify(metaObject));
          metaObject.address = address;
          if (isVerified) {
            if (databaseWorks) {
              const metadataCount = await searchDb.metadata.where('fileId').equals(metaObject.fileId).count();
              // only available data is added to the search
              // TODO: at least two times market as unavailable
              if (metadataCount === 0 && metaObject.description !== UNAVAILABLE_DESC) {
                metaObject.available = 1;
                addMetaData(metaObject);
                await searchDb.metadata.add(metaObject);
              } else if (metadataCount === 0 && metaObject.description === UNAVAILABLE_DESC) {
                metaObject.available = 0;
                await searchDb.metadata.add(metaObject);
              } else if (metaObject.description === UNAVAILABLE_DESC) {
                removeMetaData(metaObject);
                await searchDb.metadata.where('fileId').equals(metaObject.fileId).modify({ available: 0 });
              }
            } else if (metaObject.description !== UNAVAILABLE_DESC) {
              // TODO: Available system doens't work without a database
              addMetaData(metaObject);
            }
          }
        }
      }
    });

    if (databaseWorks) {
      await subscription.updateDaysLoaded(mostRecentDayNumber);
    }
  }
}

/**
 * Initialization search
 */
async function startSearch() {
  try {
    window.metadata = await searchDb.metadata.where('available').equals(1).toArray();
    window.miniSearch.addAll(window.metadata);
    updateDatabase(true);
  } catch (err) {
    console.log(err);
    window.metadata = [];
    updateDatabase(false);
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
    const inputVal = x[currentFocus].children[0].children[2].value;
    inputValToWinDowSearchSelection(inputVal);
    document.getElementById('firstField').value = window.searchSelection.fileId;
    return true;
  }

  function closeAllLists(elmnt) {
    const x = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < x.length; i += 1) {
      if (elmnt !== x[i] && elmnt !== inp) {
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
      window.searchSelection = { fileId: 'na' };
      return false;
    }
    val = fileTypePreselection(val);
    const searchResults = window.miniSearch.search(val.replace('.', ' '));
    const searchItems = [];
    for (let j = 0; j < searchResults.length; j += 1) {
      const item = window.metadata.find(o => o.fileId === searchResults[j].id);
      if (typeof item !== 'undefined') {
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
        span.innerHTML = `<strong>${prepSearchText(searchItems[i].fileName, 60)}</strong> `;
        const description = prepSearchText(searchItems[i].description, 140);
        console.log(`des: ${description}`);
        if (description === DEFAULT_DESCRIPTION) {
          span.innerHTML += `<span style='font-size: 12px;'><br>${searchItems[i].fileId} - ${timeString}</span>`;
        } else {
          span.innerHTML += `<span style='font-size: 12px;'><br>${description}<br>${searchItems[i].fileId} - ${timeString}</span>`;
        }
        span.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}=${searchItems[i].fileName}=${searchItems[i].fileType}=${searchItems[i].address}'>`;
        span.addEventListener('click', () => {
          const inputVal = span.getElementsByTagName('input')[0].value;
          inputValToWinDowSearchSelection(inputVal);
          inp.value = window.searchSelection.fileId;
          closeAllLists();
          document.getElementById('searchload').click();
        });
        const spanTwo = document.createElement('SPAN');
        spanTwo.innerHTML = '<i class="fas fa-ban"></i>';
        spanTwo.style.cssFloat = 'right';
        spanTwo.style.color = '#db3e4d';
        spanTwo.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}=${searchItems[i].fileName}=${searchItems[i].fileType}=${searchItems[i].address}'>`;
        // eslint-disable-next-line no-loop-func
        spanTwo.addEventListener('click', async () => {
          const inputVal = spanTwo.getElementsByTagName('input')[0].value;
          inputValToWinDowSearchSelection(inputVal);
          closeAllLists();
          // only removes immidiatly the blocked entry,
          // not everything from this subscriber
          removeMetaData(window.searchSelection);
          subscription.removeSubscription(window.searchSelection.address);
        });
        b.appendChild(spanTwo);
        b.appendChild(span);
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
}

autocomplete(document.getElementById('firstField'));

startSearch();
