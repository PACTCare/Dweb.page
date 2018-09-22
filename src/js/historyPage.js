"use strict";
const TRYTES = require("trytes");
const r = require("jsrsasign");
const IOTA = require("iota.lib.js");
require("./alert");
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
  let logObjects = [];
  for (var i = 0; i < logs.length; i++) {
    {
      logObjects.push({
        hash: logs[i].split("&&&")[0],
        name: logs[i].split("&&&")[1]
      });
    }
  }

  let logObjArray = [];
  let transactionsArray = [];
  console.log(logObjects);
  const iota = new IOTA({ provider: "https://nodes.thetangle.org:443" });

  for (const logObject of logObjects) {
    let transactions = await getTransaction(logObject.hash, iota);
    transactionsArray = transactionsArray.concat(transactions);
  }

  for (const transaction of transactionsArray) {
    let logObj = await getLog(iota, transaction);
    console.log(logObj);
    logObjArray.push(logObj);
  }

  console.log("Done: " + logObjArray[1]);
  if (logObjArray.length > 0) {
    printLog(logObjArray);
  }
}

function getTransaction(hash, iota) {
  const loggingAddress = TRYTES.encodeTextAsTryteString(hash).substring(0, 81);
  console.log(loggingAddress);
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
          console.log("Correct Signature");
          resolve(obj);
        } else {
          reject("Wrong Signature");
        }
      }
    });
  });
}

function compareFileId(a, b) {
  if (a.fileId < b.fileId) return -1;
  if (a.fileId > b.fileId) return 1;
  return 0;
}

function printLog(arrayOfLogObj) {
  // sort according to hashes, then time
  arrayOfLogObj.sort(compareFileId);
  const encryptedArray = arrayOfLogObj.filter(x => x.encrypted);
  const notEncryptedArray = arrayOfLogObj.filter(x => !x.encrypted);
  let flags = {};
  // for (const obj of notEncryptedArray) {
  //   if (!flags[obj.fileId]) {
  //     flags[obj.fileId] = true;
  //     let a = document.createElement("a");
  //     let linkText = document.createTextNode(obj.fileId);
  //     a.appendChild(linkText);
  //     a.title = obj.fileId;
  //     a.target = "_blank";
  //     a.href =
  //       window.location.href.replace("history", "receive") +
  //       "?id=" +
  //       obj.fileId +
  //       "&gate=" +
  //       obj.gateway +
  //       "&password=nopass";
  //     console.log(a.href);
  //     document.getElementById("unencryptedFiles").appendChild(a);
  //   }
  // } else {
  //   let li = document.createElement("li");
  //   li.style.fontSize = "12px";
  //   li.innerHTML = obj.fileId + obj.time + " " + obj.gateway;
  //   document.getElementById("unencryptedFiles").appendChild(li);
  // }
  //}
  // for (const obj of encryptedArray) {
  // }
}

// Check browser support
if (typeof Storage !== "undefined") {
  var logs = JSON.parse(localStorage.getItem("log"));
  if (logs == null) {
    document.getElementById("result").innerHTML =
      "Your personal logs are stored inside your browser and will be gone once you delete your browser storage. ";
  } else {
    createListOfLogs(logs);
  }
} else {
  document.getElementById("result").innerHTML =
    "Sorry, your browser does not support Web Storage.";
}
