import './alert';
import './tableToCsv';
import Iota from './services/Iota';
import Signature from './services/Signature';
import '../css/style.css';
import '../css/alert.css';
import '../css/table.css';

const STORAGEKEY = 'logsv0.1';

async function createListOfLogs(logs) {
  const storageLogArray = [];
  for (let i = 0; i < logs.length; i += 1) {
    {
      storageLogArray.push({
        id: logs[i].split('???')[0],
        hash: logs[i].split('???')[1].split('&&&')[0],
        name: logs[i].split('&&&')[1].split('===')[0],
        sig: logs[i].split('===')[1],
      });
    }
  }

  const iotaLogArray = [];
  const flags = {};
  const iota = new Iota();
  await Promise.all(
    storageLogArray.map(async (logObject) => {
      if (!flags[logObject.hash]) {
        flags[logObject.hash] = true;
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

  if (iotaLogArray.length > 0) {
    printLog(iotaLogArray, storageLogArray);
  } else {
    document.getElementById('csvDownload').remove();
    document.getElementById('clearHistory').remove();
  }
}

function compareTime(a, b) {
  const da = new Date(a.time).getTime();
  const db = new Date(b.time).getTime();
  if (da > db) return -1;
  if (da < db) return 1;
  return 0;
}

function hideColumns(col1, col2, col3) {
  const tbl = document.getElementById('table');
  if (tbl != null) {
    for (let i = 0; i < tbl.rows.length; i += 1) {
      for (let j = 0; j < tbl.rows[i].cells.length; j += 1) {
        tbl.rows[i].cells[j].style.display = '';
        if (j == col1 || j == col2 || j == col3) { tbl.rows[i].cells[j].style.display = 'none'; }
      }
    }
  }
}

function printLog(iotaLogArray, storageLogArray) {
  iotaLogArray.sort(compareTime);
  document.getElementById('loader').remove();
  document
    .getElementById('csvDownload')
    .setAttribute('style', 'display:inline-block !important');
  document
    .getElementById('clearHistory')
    .setAttribute('style', 'display:inline-block !important');
  const flags = {};
  const sig = new Signature();
  // remove fake double entries,
  // iotaLogArray = Array.from(new Set(iotaLogArray));
  for (const obj of iotaLogArray) {
    if (!flags[obj.fileId]) {
      flags[obj.fileId] = true;
      const table = document.getElementById('table');
      const row = table.insertRow(-1);
      const cell1 = row.insertCell(0);
      cell1.setAttribute('data-title', 'Name: ');
      const cell2 = row.insertCell(1);
      cell2.setAttribute('data-title', 'File ID: ');
      const cell3 = row.insertCell(2);
      cell3.setAttribute('data-title', 'Encrypted: ');
      const cell4 = row.insertCell(3);
      cell4.setAttribute('data-title', 'Upload: ');
      const cell5 = row.insertCell(4);
      cell5.setAttribute('data-title', 'Download: ');
      const cell6 = row.insertCell(5);
      cell6.setAttribute('data-title', 'Public Upload Signature Keys: ');
      const cell7 = row.insertCell(6);
      cell7.setAttribute('data-title', 'Public Download Signature Keys: ');
      const linkText = storageLogArray.find(x => x.hash === obj.fileId).name;
      let link = `${window.location.href.replace('history', 'receive')
      }?id=${
        obj.fileId
      }&gate=${
        obj.gateway}`;
      if (!obj.encrypted) {
        link += '&password=nopass';
      }
      cell1.innerHTML = `<a href="${link}" target="_blank">${linkText}</a>`;
      cell2.innerHTML = obj.fileId;
      if (obj.encrypted) {
        cell3.innerHTML = 'Yes';
      } else {
        cell3.innerHTML = 'No';
      }

      const signedLinkPartOne = " <a class='signRef' href='https://twitter.com/intent/tweet?text=I’m%20the%20owner%20of%20the%20following%20public%20signature%20key%20";
      const signedLinkPartTwo = "%20at%20&url=https://pact.online' target='_blank'><i class='fas fa-file-signature'></i></a>";
      let cellUpload = 'n/a';
      let cellUploadSig = 'n/a';
      const uploadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && x.upload,
      );
      for (var i = 0; i < uploadArray.length; i++) {
        const idPart = storageLogArray.find(x => x.id == uploadArray[i].id);
        if (typeof idPart !== 'undefined') {
          const pubSigKey = idPart.sig;
          const ver = sig.verification(uploadArray[i], pubSigKey);
          const pageVer = sig.pageVerification(uploadArray[i]);
          if (i === 0) {
            if (ver && pageVer) {
              cellUpload = uploadArray[i].time.replace(',', '')
                + signedLinkPartOne
                + pubSigKey
                + signedLinkPartTwo;
              cellUploadSig = pubSigKey;
            } else if (pageVer) {
              cellUpload = uploadArray[i].time.replace(',', '');
            }
          } else if (ver && pageVer) {
            cellUpload = `${cellUpload
            }\n ${
              uploadArray[i].time.replace(',', '')
            }${signedLinkPartOne
            }${pubSigKey
            }${signedLinkPartTwo}`;
            cellUploadSig = `${cellUpload}\n ${pubSigKey}`;
          } else if (pageVer) {
            cellUpload = `${cellUpload}\n ${uploadArray[i].time.replace(',', '')}`;
          }
        }
      }
      cell4.innerHTML = cellUpload;
      cell6.innerHTML = cellUploadSig;

      let cellDownload = 'n/a';
      let cellDownloadSig = 'n/a';
      const downloadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && !x.upload,
      );
      for (var i = 0; i < downloadArray.length; i++) {
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
      cell7.innerHTML = cellDownloadSig;
    }
  }
  hideColumns(1, 5, 6);
  document.getElementById('firstRow').remove();
}

// Check browser support
if (typeof Storage !== 'undefined') {
  const logs = JSON.parse(localStorage.getItem(STORAGEKEY));
  if (logs == null) {
    document.getElementById('csvDownload').remove();
    document.getElementById('clearHistory').remove();
  } else {
    document
      .getElementById('loader')
      .setAttribute('style', 'display:inherit !important');
    createListOfLogs(logs);
  }
} else {
  document.getElementById('logResult').innerHTML = 'Sorry, your browser does not support Web Storage.';
}
