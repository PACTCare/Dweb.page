import '../services/tableToCsv';
import Iota from '../log/Iota';
import Signature from '../log/secp256k1';
import compareTime from '../helperFunctions/compareTime';
import '../../css/table.css';
import '../polyfill/remove';

const STORAGEKEY = 'logsv0.1';
const iotaFlags = {};

function hideColumns(col1, col2, col3) {
  const tbl = document.getElementById('table');
  if (tbl != null) {
    for (let i = 0; i < tbl.rows.length; i += 1) {
      for (let j = 0; j < tbl.rows[i].cells.length; j += 1) {
        tbl.rows[i].cells[j].style.display = '';
        if (j === col1 || j === col2 || j === col3) { tbl.rows[i].cells[j].style.display = 'none'; }
      }
    }
  }
}

function printLog(iotaLogArray, storageLogArray) {
  iotaLogArray.sort(compareTime);
  document.getElementById('csvDownload').style.visibility = 'visible';
  document.getElementById('clearHistory').style.visibility = 'visible';
  const sig = new Signature();
  // remove fake double entries,
  // iotaLogArray = Array.from(new Set(iotaLogArray));
  // for (const obj of iotaLogArray)
  for (let j = 0; j < iotaLogArray.length; j += 1) {
    if (!iotaFlags[iotaLogArray[j].fileId]) {
      iotaFlags[iotaLogArray[j].fileId] = true;
      const table = document.getElementById('table');
      const row = table.insertRow(-1);
      const cell1 = row.insertCell(0);
      cell1.setAttribute('data-title', 'Name: ');
      const cell2 = row.insertCell(1);
      cell2.setAttribute('data-title', 'File ID: ');
      const cell3 = row.insertCell(2);
      cell3.setAttribute('data-title', 'Mode: ');
      const cell4 = row.insertCell(3);
      cell4.setAttribute('data-title', 'Upload: ');
      const cell5 = row.insertCell(4);
      cell5.setAttribute('data-title', 'Download: ');
      const cell6 = row.insertCell(5);
      cell6.setAttribute('data-title', 'Public Upload Signature Keys: ');
      const cell7 = row.insertCell(6);
      cell7.setAttribute('data-title', 'Public Download Signature Keys: ');
      const linkText = storageLogArray.find(x => x.hash === iotaLogArray[j].fileId).name;
      let link = `${window.location.href.replace('history', 'receive')
      }?id=${
        iotaLogArray[j].fileId
      }`;
      // see Iota.js for the setup of the log
      // public = PU
      if (iotaLogArray[j].tag.substring(4, 6) === 'PU') {
        link += '&password=nopass';
      }
      cell1.innerHTML = `<a href="${link}" target="_blank">${linkText}</a>`;
      cell2.textContent = iotaLogArray[j].fileId;
      // private = PR
      if (iotaLogArray[j].tag.substring(4, 6) === 'PR') {
        cell3.textContent = 'Private';
      } else {
        cell3.textContent = 'Public';
      }

      const signedLinkPartOne = " <a class='signRef' href='https://twitter.com/intent/tweet?text=I’m%20the%20owner%20of%20the%20following%20public%20signature%20key%20";
      const signedLinkPartTwo = "%20at%20&url=https://pact.online' target='_blank'><i class='fas fa-file-signature'></i></a>";
      let cellUpload = 'N/A';
      let cellUploadSig = 'N/A';
      const uploadArray = iotaLogArray.filter(
        x => x.fileId === iotaLogArray[j].fileId && x.tag.substring(6, 7) === 'U', // U = Upload
      );
      for (let i = 0; i < uploadArray.length; i += 1) {
        const idPart = storageLogArray.find(x => x.id == uploadArray[i].id);
        if (typeof idPart !== 'undefined') {
          const pubSigKey = idPart.sig;
          const ver = sig.verification(uploadArray[i], pubSigKey);
          if (i === 0) {
            if (ver) {
              cellUpload = uploadArray[i].time.replace(',', '')
                + signedLinkPartOne
                + pubSigKey
                + signedLinkPartTwo;
              cellUploadSig = pubSigKey;
            } else {
              cellUpload = uploadArray[i].time.replace(',', '');
            }
          } else if (ver) {
            cellUpload = `${cellUpload
            }\n ${
              uploadArray[i].time.replace(',', '')
            }${signedLinkPartOne
            }${pubSigKey
            }${signedLinkPartTwo}`;
            cellUploadSig = `${cellUpload}\n ${pubSigKey}`;
          } else {
            cellUpload = `${cellUpload}\n ${uploadArray[i].time.replace(',', '')}`;
          }
        }
      }
      cell4.innerHTML = cellUpload;
      cell6.textContent = cellUploadSig;

      let cellDownload = 'N/A';
      if (iotaLogArray[j].tag.substring(4, 6) === 'PU') {
        cellDownload = 'N/A in public mode';
      }
      let cellDownloadSig = 'N/A';

      // Shows downloads only for private downloads
      // D = Download, PR = Private
      const downloadArray = iotaLogArray.filter(
        x => x.fileId === iotaLogArray[j].fileId && x.tag.substring(6, 7) === 'D' && x.tag.substring(4, 6) === 'PR',
      );
      for (let i = 0; i < downloadArray.length; i += 1) {
        const idPart = storageLogArray.find(x => x.id == downloadArray[i].id);
        if (typeof idPart !== 'undefined') {
          const pubSigKey = idPart.sig;
          const ver = sig.verification(downloadArray[i], pubSigKey);
          if (i === 0) {
            if (ver) {
              cellDownload = downloadArray[i].time.replace(',', '')
                + signedLinkPartOne
                + pubSigKey
                + signedLinkPartTwo;
              cellDownloadSig = pubSigKey;
            } else {
              cellDownload = downloadArray[i].time.replace(',', '');
            }
          } else if (ver) {
            cellDownload = `${cellDownload
            }\n ${
              downloadArray[i].time.replace(',', '')
            }${signedLinkPartOne
            }${pubSigKey
            }${signedLinkPartTwo}`;
            cellDownloadSig = `${cellDownloadSig}\n ${pubSigKey}`;
          } else {
            cellDownload = `${cellDownload}\n ${downloadArray[i].time.replace(',', '')}`;
          }
        }
      }
      cell5.innerHTML = cellDownload;
      cell7.textContent = cellDownloadSig;
    }
  }
  hideColumns(1, 5, 6);
  if (document.getElementById('firstRow') !== null) {
    document.getElementById('firstRow').remove();
  }
}

async function createListOfLogs(logs) {
  const storageLogArray = [];
  for (let i = 0; i < logs.length; i += 1) {
    storageLogArray.push({
      id: logs[i].split('???')[0],
      hash: logs[i].split('???')[1].split('&&&')[0],
      name: logs[i].split('&&&')[1].split('===')[0],
      sig: logs[i].split('===')[1],
    });
  }
  const iotaLogArray = [];
  const iota = new Iota();
  const logFlags = {};
  await Promise.all(
    storageLogArray.map(async (logObject) => {
      if (!logFlags[logObject.hash]) {
        logFlags[logObject.hash] = true;
        const transactions = await iota.getTransaction(logObject.hash);
        await Promise.all(
          transactions.map(async (transaction) => {
            const logObj = await iota.getLog(transaction);
            iotaLogArray.push(logObj);
          }),
        );
      }
    }),
  );
  document.getElementById('loader').style.visibility = 'hidden';
  if (iotaLogArray.length > 0) {
    printLog(iotaLogArray, storageLogArray);
  }
}

document.getElementById('clearHistory').addEventListener('click', () => {
  window.localStorage.removeItem(STORAGEKEY);
  window.location.reload();
});
// Check browser support
document.getElementById('toHistory').addEventListener('click', () => {
  if (typeof Storage !== 'undefined') {
    const logs = JSON.parse(localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      document.getElementById('csvDownload').style.visibility = 'hidden';
      document.getElementById('clearHistory').style.visibility = 'hidden';
    } else {
      document.getElementById('loader').style.visibility = 'visible';
      createListOfLogs(logs);
    }
  } else {
    document.getElementById('logResult').innerHTML = 'Sorry, your browser does not support Web Storage.';
  }
});
