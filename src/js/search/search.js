import MiniSearch from 'minisearch';
import FileType from '../services/FileType';
import removeMetaData from './removeMetaData';
import sortByScoreAndTime from './sortByScoreAndTime';
import MetadataDb from './MetadataDb';
import prepSearchText from './prepSearchText';
import loadMetadata from './loadMetadata';
import { DEFAULT_DESCRIPTION } from './searchConfig';
import Error from '../error';

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
    uploadGateway: inputVal.split('=')[4],
  };
}

/**
 * Initialization search
 */
async function startSearch() {
  try {
    window.metadata = await new MetadataDb().getMetadata();
    window.miniSearch.addAll(window.metadata);
    loadMetadata(true);
  } catch (err) {
    console.error(Error.SEARCH_DB_NA);
    window.metadata = [];
    loadMetadata(false);
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
      return false;
    }
    // Always reset to nothing found
    window.searchSelection = { fileId: 'na' };
    document.getElementById('messagesSearch').textContent = '';
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
        span.innerHTML = `<strong>${prepSearchText(searchItems[i].fileName, 60)}</strong> <span style='font-size: 12px;'>[${searchItems[i].fileType}]</span>`;
        const description = prepSearchText(searchItems[i].description, 140);
        const lengthTest = (` ${description}`);
        if (description === DEFAULT_DESCRIPTION || lengthTest.length <= 3) {
          span.innerHTML += `<span style='font-size: 12px;'><br>${searchItems[i].fileId} - ${timeString}</span>`;
        } else {
          span.innerHTML += `<span style='font-size: 12px;'><br>${description}<br>${searchItems[i].fileId} - ${timeString}</span>`;
        }
        span.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}=${searchItems[i].fileName}=${searchItems[i].fileType}=${searchItems[i].address}=${searchItems[i].gateway}'>`;
        span.addEventListener('click', () => {
          const inputVal = span.getElementsByTagName('input')[0].value;
          inputValToWinDowSearchSelection(inputVal);
          inp.value = window.searchSelection.fileId;
          document.getElementById('searchload').click();
        });
        const spanTwo = document.createElement('SPAN');
        spanTwo.innerHTML = '<i class="fas fa-ban"></i>';
        spanTwo.style.cssFloat = 'right';
        spanTwo.style.color = '#db3e4d';
        spanTwo.innerHTML += `<input type='hidden' value='${searchItems[i].fileId}=${searchItems[i].fileName}=${searchItems[i].fileType}=${searchItems[i].address}=${searchItems[i].gateway}'>`;
        // eslint-disable-next-line no-loop-func
        spanTwo.addEventListener('click', async () => {
          const inputVal = spanTwo.getElementsByTagName('input')[0].value;
          inputValToWinDowSearchSelection(inputVal);
          closeAllLists();
          // only removes immidiatly the blocked entry,
          // not everything from this subscriber
          removeMetaData(window.searchSelection);
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

  document.getElementById('searchload').addEventListener('click', () => {
    closeAllLists();
  });

  document
    .getElementById('firstField')
    .addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('searchload').click();
      }
    });
}

autocomplete(document.getElementById('firstField'));

startSearch();
