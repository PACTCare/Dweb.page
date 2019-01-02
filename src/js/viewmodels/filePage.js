import '../services/tableToCsv';
import Iota from '../iota/Iota';
import FileType from '../services/FileType';
import compareTime from '../helperFunctions/compareTime';
import '../../css/table.css';
import '../polyfill/remove';
import db from '../log/logDb';
import Signature from '../crypto/Signature';
import prepObjectForSignature from '../crypto/prepObjectForSignature';

const sig = new Signature();
const iota = new Iota();
const iotaFlags = {};

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

function printLog(iotaLogArray, logsDb) {
  logsDb.sort(compareTime);
  document.getElementById('csvDownload').style.visibility = 'visible';
  document.getElementById('clearHistory').style.visibility = 'visible';
  for (let j = 0; j < logsDb.length; j += 1) {
    if (!iotaFlags[logsDb[j].fileId]) {
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
      cell4.setAttribute('data-title', 'Mode: ');
      const cell5 = row.insertCell(4);
      cell5.setAttribute('data-title', 'Upload: ');
      const cell6 = row.insertCell(5);
      cell6.setAttribute('data-title', 'Download: ');

      const linkText = logsDb[j].filename;
      let link = `${window.location.href
      }?id=${
        logsDb[j].fileId
      }`;
      // TODO: implement link system that works with files that don't support direct link
      //
      if (!logsDb[j].isPrivate) {
        link = `${link.split('/ipfs/')[0]}/ipfs/${logsDb[j].fileId}`;
      }

      const [, , fileTypePart] = linkText.match(/(.*)\.(.*)/);
      cell1.innerHTML = FileType.returnFileIcon(fileTypePart);
      cell1.style.fontSize = '18px';
      cell2.innerHTML = `<a href="${link}" target="_blank">${linkText}</a>`;
      cell3.textContent = logsDb[j].fileId;
      cell4.textContent = 'Private';
      if (!logsDb[j].isPrivate) {
        cell4.textContent = 'Public';
      }

      // const downloadArray = logsDb.filter(
      //   x => x.fileId === logsDb[j].fileId && !x.isUpload,
      // );
      const uploadArray = logsDb.filter(
        x => x.fileId === logsDb[j].fileId && x.isUpload,
      );

      let cellUpload = '--';
      for (let i = 0; i < uploadArray.length; i += 1) {
        if (i === 0) {
          cellUpload = uploadArray[i].time.replace(',', '');
        } else {
          cellUpload = `${cellUpload}\n ${uploadArray[i].time.replace(',', '')}`;
        }
      }
      cell5.textContent = cellUpload;

      const cellDownload = '--';
      // for (let i = 0; i < downloadArray.length; i += 1) {
      //   if (i === 0) {
      //     cellDownload = downloadArray[i].time.replace(',', '');
      //   } else {
      //     cellDownload = `${cellDownload}\n ${downloadArray[i].time.replace(',', '')}`;
      //   }
      // }
      cell6.textContent = cellDownload;
    }
  }
  hideColumns(2);
  if (document.getElementById('firstRow') !== null) {
    document.getElementById('firstRow').remove();
  }
}

async function loadInfoFromTangle(logsDb) {
  const iotaLogArray = [];
  // const iota = new Iota();
  // const sig = new Signature();
  // const logFlags = {};

  // TODO: only new downloads need to be loaded from IOTA
  // await Promise.all(
  //   logsDb.map(async (logObject) => {
  //     if (!logFlags[logObject.fileId]) {
  //       logFlags[logObject.fileId] = true;
  //       const privateTransactions = await iota.getTransactionByHash(logObject.fileId);
  //       await Promise.all(
  //         privateTransactions.map(async (transaction) => {
  //           let logObj = await iota.getMessage(transaction);
  //           const publicKey = await sig.importPublicKey(logObj.publicHexKey);
  //           const { signature } = logObj;
  //           logObj = prepObjectForSignature(logObj);
  //           const isVerified = await sig.verify(publicKey, signature, JSON.stringify(logObj));
  //           if (isVerified) {
  //             iotaLogArray.push(logObj);
  //           }
  //         }),
  //       );
  //     }
  //   }),
  // );
  document.getElementById('loader').style.visibility = 'hidden';
  if (logsDb.length > 0) {
    printLog(iotaLogArray, logsDb);
  }
}

document.getElementById('clearHistory').addEventListener('click', async () => {
  await db.log.clear();
  window.location.reload();
});

document.getElementById('toFile').addEventListener('click', async () => {
  await iota.nodeInitialization();
  const keys = await sig.getKeys();
  const publicHexKey = await sig.exportPublicKey(keys.publicKey);
  const publicTryteKey = iota.hexKeyToTryte(publicHexKey);
  document.getElementById('publicTryteKey').textContent = publicTryteKey;
  document.getElementById('publicTryteKey').setAttribute('href', `https://thetangle.org/address/${publicTryteKey.slice(0, 81)}`);
  try {
    const logsDb = await db.log.toArray();
    if (logsDb == null) {
      document.getElementById('csvDownload').style.visibility = 'hidden';
      document.getElementById('clearHistory').style.visibility = 'hidden';
    } else {
      console.log(logsDb);
      document.getElementById('loader').style.visibility = 'visible';
      loadInfoFromTangle(logsDb);
    }
  } catch (error) {
    console.log(error);
    document.getElementById('logResult').innerHTML = 'Sorry, your browser does not support Web Storage.';
  }
});

function sortTable(n) {
  console.log('start');
  let rows; let switching; let i; let x; let y; let shouldSwitch; let dir; let
    switchcount = 0;
  const table = document.getElementById('table');
  switching = true;
  dir = 'asc';
  while (switching) {
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i += 1) {
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName('TD')[n];
      y = rows[i + 1].getElementsByTagName('TD')[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
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
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
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
