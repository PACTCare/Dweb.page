"use strict";
const TRYTES = require("trytes");
const r = require("jsrsasign");
const IOTA = require("iota.lib.js");
require("./alert");
require("./tableToCsv");
import "../css/style.css";
import "../css/alert.css";
import "../css/table.css";

const curve = "secp256k1";
const sigalg = "SHA256withECDSA";

const verification = (msg, sigValueHex) => {
  var sig = new r.KJUR.crypto.Signature({
    alg: sigalg,
    prov: "cryptojs/jsrsa"
  });
  sig.init({
    xy:
      "04700a45dd4a19488bd8863baa493ff5756f1a23b5de982e86cca1688cfdf3ad90880d7d0d600541fdcc263d866c582ea48668ef9dab5bd46a41f92323c193a0fc",
    curve: curve
  });
  sig.updateString(msg);
  return sig.verify(sigValueHex);
};

async function createListOfLogs(logs) {
  let storageLogArray = [];
  for (var i = 0; i < logs.length; i++) {
    {
      storageLogArray.push({
        hash: logs[i].split("&&&")[0],
        name: logs[i].split("&&&")[1]
      });
    }
  }

  let iotaLogArray = [];
  const iota = new IOTA({ provider: "https://nodes.thetangle.org:443" });

  await Promise.all(
    storageLogArray.map(async logObject => {
      let transactions = await getTransaction(logObject.hash, iota);
      await Promise.all(
        transactions.map(async transaction => {
          let logObj = await getLog(iota, transaction);
          iotaLogArray.push(logObj);
        })
      );
    })
  );

  if (iotaLogArray.length > 0) {
    printLog(iotaLogArray, storageLogArray);
  } else {
    document.getElementById("csvDownload").remove();
    document.getElementById("clearHistory").remove();
  }
}

function getTransaction(hash, iota) {
  const loggingAddress = TRYTES.encodeTextAsTryteString(hash).substring(0, 81);
  var searchVarsAddress = {
    addresses: [loggingAddress]
  };
  return new Promise((resolve, reject) => {
    iota.api.findTransactions(searchVarsAddress, function(error, transactions) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        {
          resolve(transactions);
        }
      }
    });
  });
}

function getLog(iota, transaction) {
  return new Promise((resolve, reject) => {
    iota.api.getBundle(transaction, function(error, sucess2) {
      if (error) {
        console.log(error);
      } else {
        var message = sucess2[0].signatureMessageFragment;
        message = message.split(
          "99999999999999999999999999999999999999999999999999"
        )[0];
        var obj = JSON.parse(iota.utils.fromTrytes(message));
        var stringVerification =
          obj.fileId + obj.time + obj.gateway + obj.isUpload + obj.encrypted;
        if (verification(stringVerification, obj.signature)) {
          resolve(obj);
        } else {
          reject("Wrong Signature");
        }
      }
    });
  });
}

function compareTime(a, b) {
  let da = new Date(a.time).getTime();
  let db = new Date(b.time).getTime();
  if (da > db) return -1;
  if (da < db) return 1;
  return 0;
}

function hideColumn(col) {
  var tbl = document.getElementById("table");
  if (tbl != null) {
    for (var i = 0; i < tbl.rows.length; i++) {
      for (var j = 0; j < tbl.rows[i].cells.length; j++) {
        tbl.rows[i].cells[j].style.display = "";
        if (j == col) tbl.rows[i].cells[j].style.display = "none";
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
      let cellUpload = "n/a";
      const uploadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && x.isUpload
      );
      for (var i = 0; i < uploadArray.length; i++) {
        if (i === 0) {
          cellUpload = uploadArray[i].time.replace(",", "");
        } else {
          cellUpload =
            cellUpload + "\n " + uploadArray[i].time.replace(",", "");
        }
      }
      cell4.innerHTML = cellUpload;

      let cellDownload = "n/a";
      const downloadArray = iotaLogArray.filter(
        x => x.fileId === obj.fileId && !x.isUpload
      );
      for (var i = 0; i < downloadArray.length; i++) {
        if (i === 0) {
          cellDownload = downloadArray[i].time.replace(",", "");
        } else {
          cellDownload =
            cellDownload + "\n " + downloadArray[i].time.replace(",", "");
        }
      }
      cell5.innerHTML = cellDownload;
    }
  }
  hideColumn(1);
  document.getElementById("firstRow").remove();
}

// Check browser support
if (typeof Storage !== "undefined") {
  var logs = JSON.parse(localStorage.getItem("log"));
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
