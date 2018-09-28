"use strict";

require("./alert");
require("./tableToCsv");
import { Iota } from "./services/Iota";
import { Signature } from "./services/Signature";
import "../css/style.css";
import "../css/alert.css";
import "../css/table.css";

const STORAGEKEY = "logs";

async function createListOfLogs(logs) {
  let storageLogArray = [];
  for (var i = 0; i < logs.length; i++) {
    {
      storageLogArray.push({
        id: logs[i].split("???")[0],
        hash: logs[i].split("???")[1].split("&&&")[0],
        name: logs[i].split("&&&")[1].split("===")[0],
        sig: logs[i].split("===")[1]
      });
    }
  }

  let iotaLogArray = [];
  let flags = {};
  const iota = new Iota();
  await Promise.all(
    storageLogArray.map(async logObject => {
      if (!flags[logObject.hash]) {
        flags[logObject.hash] = true;
        let transactions = await iota.getTransaction(logObject.hash);
        await Promise.all(
          transactions.map(async transaction => {
            let logObj = await iota.getLog(transaction);
            iotaLogArray.push(logObj);
          })
        );
      }
    })
  );

  if (iotaLogArray.length > 0) {
    printLog(iotaLogArray, storageLogArray);
  } else {
    document.getElementById("csvDownload").remove();
    document.getElementById("clearHistory").remove();
  }
}

function compareTime(a, b) {
  let da = new Date(a.time).getTime();
  let db = new Date(b.time).getTime();
  if (da > db) return -1;
  if (da < db) return 1;
  return 0;
}

function hideColumns(col1, col2, col3) {
  var tbl = document.getElementById("table");
  if (tbl != null) {
    for (var i = 0; i < tbl.rows.length; i++) {
      for (var j = 0; j < tbl.rows[i].cells.length; j++) {
        tbl.rows[i].cells[j].style.display = "";
        if (j == col1 || j == col2 || j == col3)
          tbl.rows[i].cells[j].style.display = "none";
      }
    }
  }
}

function printLog(iotaLogArray, storageLogArray) {
  iotaLogArray.sort(compareTime);
  document.getElementById("loader").remove();
  document
    .getElementById("csvDownload")
    .setAttribute("style", "display:inline-block !important");
  document
    .getElementById("clearHistory")
    .setAttribute("style", "display:inline-block !important");
  let flags = {};
  const sig = new Signature();
  // remove fake double entries,
  // iotaLogArray = Array.from(new Set(iotaLogArray));
  for (const obj of iotaLogArray) {
    if (!flags[obj.fileId]) {
      flags[obj.fileId] = true;
      var table = document.getElementById("table");
      var row = table.insertRow(-1);
      var cell1 = row.insertCell(0);
      cell1.setAttribute("data-title", "Name: ");
      var cell2 = row.insertCell(1);
      cell2.setAttribute("data-title", "File ID: ");
      var cell3 = row.insertCell(2);
      cell3.setAttribute("data-title", "Encrypted: ");
      var cell4 = row.insertCell(3);
      cell4.setAttribute("data-title", "Upload: ");
      var cell5 = row.insertCell(4);
      cell5.setAttribute("data-title", "Download: ");
      var cell6 = row.insertCell(5);
      cell6.setAttribute("data-title", "Public Upload Signature Keys: ");
      var cell7 = row.insertCell(6);
      cell7.setAttribute("data-title", "Public Download Signature Keys: ");
      let linkText = storageLogArray.find(x => x.hash === obj.fileId).name;
      let link =
        window.location.href.replace("history", "receive") +
        "?id=" +
        obj.fileId +
        "&gate=" +
        obj.gateway;
      if (!obj.encrypted) {
        link = link + "&password=nopass";
      }
      cell1.innerHTML =
        '<a href="' + link + '" target="_blank">' + linkText + "</a>";
      cell2.innerHTML = obj.fileId;
      if (obj.encrypted) {
        cell3.innerHTML = "Yes";
      } else {
        cell3.innerHTML = "No";
      }

      let signedText =
        " <i style='color: #6f6f6f;' class='fas fa-file-signature'></i>"; //" (Signed by you)";
      let cellUpload = "n/a";
      let cellUploadSig = "n/a";
      const uploadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && x.upload
      );
      for (var i = 0; i < uploadArray.length; i++) {
        let idPart = storageLogArray.find(x => x.id == uploadArray[i].id);
        if (typeof idPart != "undefined") {
          let pubSigKey = idPart.sig;
          let ver = sig.verification(uploadArray[i], pubSigKey);
          if (i === 0) {
            if (ver) {
              cellUpload = uploadArray[i].time.replace(",", "") + signedText;
              cellUploadSig = pubSigKey;
            } else {
              cellUpload = uploadArray[i].time.replace(",", "");
            }
          } else {
            if (ver) {
              cellUpload =
                cellUpload +
                "\n " +
                uploadArray[i].time.replace(",", "") +
                signedText;
              cellUploadSig = cellUpload + "\n " + pubSigKey;
            } else {
              cellUpload =
                cellUpload + "\n " + uploadArray[i].time.replace(",", "");
            }
          }
        }
      }
      cell4.innerHTML = cellUpload;
      cell6.innerHTML = cellUploadSig;

      let cellDownload = "n/a";
      let cellDownloadSig = "n/a";
      const downloadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && !x.upload
      );
      for (var i = 0; i < downloadArray.length; i++) {
        let idPart = storageLogArray.find(x => x.id == downloadArray[i].id);
        if (typeof idPart != "undefined") {
          let pubSigKey = idPart.sig;
          let ver = sig.verification(downloadArray[i], pubSigKey);
          if (i === 0) {
            if (ver) {
              cellDownload =
                downloadArray[i].time.replace(",", "") + signedText;
              cellDownloadSig = pubSigKey;
            } else {
              cellDownload = downloadArray[i].time.replace(",", "");
            }
          } else {
            if (ver) {
              cellDownload =
                cellDownload +
                "\n " +
                downloadArray[i].time.replace(",", "") +
                signedText;
              cellDownloadSig = cellDownloadSig + "\n " + pubSigKey;
            } else {
              cellDownload =
                cellDownload + "\n " + downloadArray[i].time.replace(",", "");
            }
          }
        }
      }
      cell5.innerHTML = cellDownload;
      cell7.innerHTML = cellDownloadSig;
    }
  }
  hideColumns(1, 5, 6);
  document.getElementById("firstRow").remove();
}

// Check browser support
if (typeof Storage !== "undefined") {
  var logs = JSON.parse(localStorage.getItem(STORAGEKEY));
  if (logs == null) {
    document.getElementById("csvDownload").remove();
    document.getElementById("clearHistory").remove();
  } else {
    document
      .getElementById("loader")
      .setAttribute("style", "display:inherit !important");
    createListOfLogs(logs);
  }
} else {
  document.getElementById("logResult").innerHTML =
    "Sorry, your browser does not support Web Storage.";
}
