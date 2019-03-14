import '../services/tableToCsv';
import FileType from '../services/FileType';
import compareTime from '../helperFunctions/compareTime';
import '../../css/table.css';
import logDb from '../log/logDb';
import createDayNumber from '../search/createDayNumber';
import daysToLoadNr from '../search/dayToLoadNr';

const iotaFlags = {};
const STORAGEKEY = 'loadedDayNumber';

function hideColumns(col1) {
  const tbl = document.getElementById('table');
  if (tbl != null) {
    for (let i = 0; i < tbl.rows.length; i += 1) {
      for (let j = 0; j < tbl.rows[i].cells.length; j += 1) {
        tbl.rows[i].cells[j].style.display = '';
        if (j === col1) { tbl.rows[i].cells[j].style.display = 'none'; }
      }
    }
  }
}

function upDownloadBox(contentArray) {
  const cellContent = '--';
  for (let i = 0; i < contentArray.length; i += 1) {
    const timeText = contentArray[i].time.replace(',', '').replace(' GMT', '').slice(0, -3).substr(4);
  }
  return cellContent;
}

function printLog(logsDb) {
  logsDb.sort(compareTime);
  document.getElementById('csvDownload').style.visibility = 'visible';
  document.getElementById('clearHistory').style.visibility = 'visible';
  for (let j = 0; j < logsDb.length; j += 1) {
    // Downloads don't have a name
    if (!iotaFlags[logsDb[j].fileId] && logsDb[j].isUpload) {
      iotaFlags[logsDb[j].fileId] = true;
      const table = document.getElementById('table');
      const row = table.insertRow(-1);
      const cell1 = row.insertCell(0);
      cell1.setAttribute('data-title', '');
      const cell2 = row.insertCell(1);
      cell2.setAttribute('data-title', 'Name: ');
      const cell3 = row.insertCell(2);
      cell3.setAttribute('data-title', 'File ID: ');
      const cell4 = row.insertCell(3);
      cell4.setAttribute('data-title', 'Price: ');
      const cell5 = row.insertCell(4);
      cell5.setAttribute('data-title', 'Upload: ');
      const cell6 = row.insertCell(5);
      cell6.setAttribute('data-title', 'Download: ');

      const linkText = logsDb[j].filename;
      let link = `${window.location.href}?id=${logsDb[j].fileId}`;
      if (!logsDb[j].isPrivate) {
        link = `${window.location.href}?id=${logsDb[j].fileId}&password=np&name=${logsDb[j].filename}`;
      }
      const [, , fileTypePart] = linkText.match(/(.*)\.(.*)/);
      cell1.innerHTML = FileType.returnFileIcon(fileTypePart);
      cell1.style.fontSize = '18px';
      cell2.innerHTML = `<a href="${link}" target="_blank">${linkText}</a>`;
      cell3.textContent = logsDb[j].fileId;
      cell4.textContent = 'Private';
      // price
      if (!logsDb[j].isPrivate) {
        cell4.innerHTML = `${logsDb[j].price} <i class="far fa-star"></i>`;
      }

      const downloadArray = logsDb.filter(
        x => x.fileId === logsDb[j].fileId && !x.isUpload,
      );
      const uploadArray = logsDb.filter(
        x => x.fileId === logsDb[j].fileId && x.isUpload,
      );
      cell5.innerHTML = upDownloadBox(uploadArray);
      cell6.innerHTML = upDownloadBox(downloadArray);
    }
  }
  hideColumns(2);
  if (document.getElementById('firstRow') !== null) {
    document.getElementById('firstRow').remove();
  }
}

async function updateFromStarlog(logsDb) {
  const logFlags = {};
  const awaitTransactions = new Map();
  for (let i = 0; i < logsDb.length; i += 1) {
    const logObject = logsDb[i];
    if (!logFlags[logObject.fileId]) {
      logFlags[logObject.fileId] = true;
      awaitTransactions.set(logObject.fileId, window.starlog.loadMetadatByHash(logObject.fileId));
      // const array = map.get('ipfs_hash'); // returns an array with 46 elements and the words elements is what I am looking for!
      // const price = map.get('price').words[0];
    }
  }

  const transactionsArrays = await Promise.all(awaitTransactions);
  // TODO: if price different update

  // await Promise.all(
  //   transactions.map(async (transaction) => {
  //     let logObj = await iota.getMessage(transaction);
  //     // only add if it's not already part of the logsDB
  //     if (typeof logObj !== 'undefined') {
  //       const count = await logDb.log.where('time').equals(logObj.time).count();
  //       if (count === 0) {
  //         const publicKey = await sig.importPublicKey(logObj.publicHexKey);
  //         const { signature } = logObj;
  //         logObj = prepObjectForSignature(logObj);
  //         const isVerified = await sig.verify(publicKey, signature, JSON.stringify(logObj));
  //         if (isVerified) {
  //           const newEntry = {
  //             fileId: logObj.fileId,
  //             filename: 'na',
  //             time: logObj.time,
  //             isUpload: false,
  //             isPrivate: true,
  //             folder: 'none',
  //           };
  //           logsDb.push(newEntry);
  //           await logDb.log.add(newEntry);
  //         }
  //       }
  //     }
  //   }),
  // );

  // window.localStorage.setItem(STORAGEKEY, mostRecentDayNumber.toString());
  document.getElementById('loader').style.visibility = 'hidden';
  if (logsDb.length > 0) {
    printLog(logsDb);
  }
}

document.getElementById('clearHistory').addEventListener('click', async () => {
  await logDb.log.clear();
  window.location.reload();
});

document.getElementById('toFile').addEventListener('click', async () => {
  try {
    const logsDb = await logDb.log.toArray();
    if (logsDb == null) {
      document.getElementById('csvDownload').style.visibility = 'hidden';
      document.getElementById('clearHistory').style.visibility = 'hidden';
    } else {
      document.getElementById('loader').style.visibility = 'visible';
      updateFromStarlog(logsDb);
    }
  } catch (error) {
    document.getElementById('tableDiv').style.margin = '1.5rem';
    document.getElementById('tableDiv').style.font = 'font-family: Roboto,sans-serif';
    document.getElementById('tableDiv').style.color = '#6f6f6f';
    document.getElementById('tableDiv').textContent = 'It seems your browser doesn’t allow Dweb.page to store data locally (e.g., because of the Firefox private mode)! Therefore, your public key will constantly change and you won’t have access to your file history. ';
  }
});

function sortTable(n) {
  let switching; let i; let x; let y; let shouldSwitch; let dir; let
    switchcount = 0;
  const table = document.getElementById('table');
  switching = true;
  dir = 'asc';
  while (switching) {
    switching = false;
    const { rows } = table;
    for (i = 1; i < (rows.length - 1); i += 1) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName('TD')[n];
      y = rows[i + 1].getElementsByTagName('TD')[n];
      if (dir === 'asc') {
        const arrowDown = '<i class="fas fa-arrow-down"></i>';
        if (n === 1) {
          document.getElementById('sortNameIcon').innerHTML = arrowDown;
        } else if (n === 3) {
          document.getElementById('sortModeIcon').innerHTML = arrowDown;
        } else if (n === 4) {
          document.getElementById('sortUploadIcon').innerHTML = arrowDown;
        } else if (n === 5) {
          document.getElementById('sortDownloadIcon').innerHTML = arrowDown;
        }

        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir === 'desc') {
        const arrowUp = '<i class="fas fa-arrow-up"></i>';
        if (n === 1) {
          document.getElementById('sortNameIcon').innerHTML = arrowUp;
        } else if (n === 3) {
          document.getElementById('sortModeIcon').innerHTML = arrowUp;
        } else if (n === 4) {
          document.getElementById('sortUploadIcon').innerHTML = arrowUp;
        } else if (n === 5) {
          document.getElementById('sortDownloadIcon').innerHTML = arrowUp;
        }
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount += 1;
    } else if (switchcount === 0 && dir === 'asc') {
      dir = 'desc';
      switching = true;
    }
  }
}

document.getElementById('sortName').addEventListener('click', async () => {
  sortTable(1);
});
document.getElementById('modeName').addEventListener('click', async () => {
  sortTable(3);
});
document.getElementById('uploadName').addEventListener('click', async () => {
  sortTable(4);
});
document.getElementById('downloadName').addEventListener('click', async () => {
  sortTable(5);
});

document.getElementById('historyLongText').addEventListener('scroll', function scroll() {
  const translate = `translate(0,${this.scrollTop}px)`;
  this.querySelector('thead').style.transform = translate;
});
