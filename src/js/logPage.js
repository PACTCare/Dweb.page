"use strict";
const TRYTES = require("trytes");
const r = require("jsrsasign");
const IOTA = require("iota.lib.js");
import "../css/style.css";
import "../css/log.css";

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

async function createListOfLogs(storedHashes) {
  var arrayOfLogObj = [];
  console.log(storedHashes);
  document.getElementById("result").appendChild(document.createElement("br"));
  const iota = new IOTA({ provider: "https://nodes.thetangle.org:443" });
  for (const hash of storedHashes) {
    const loggingAddress = TRYTES.encodeTextAsTryteString(hash);
    console.log(loggingAddress);
    var searchVarsAddress = {
      addresses: [loggingAddress]
    };
    await iota.api.findTransactions(searchVarsAddress, async function(
      error,
      sucess
    ) {
      if (error) {
        console.log(error);
      } else {
        for (const entry of sucess) {
          await iota.api.getBundle(entry, async function(error, sucess2) {
            await arrayOfLogObj.push(getLog(error, sucess2, iota));
          });
        }
      }
    });
  }

  console.log("after loops: " + arrayOfLogObj);
  printLog(arrayOfLogObj);
}

function printLog(arrayOfLogObj) {
  for (const obj of arrayOfLogObj) {
    if (obj.isUpload) {
      let a = document.createElement("a");
      let linkText = document.createTextNode(hash);
      a.appendChild(linkText);
      a.title = hash;
      a.href = "https://pact.online/receive.html?id=" + hash + "&gate=" + gate;
      document
        .getElementById("result")
        .appendChild(document.createElement("br"));
      document.getElementById("result").appendChild(a);
    } else {
      let li = document.createElement("li");
      li.style.fontSize = "12px";
      li.innerHTML = "Download from " + obj.message.split(" on ")[1];
      document.getElementById("result").appendChild(li);
    }
  }
}

// Check browser support
if (typeof Storage !== "undefined") {
  var logs = JSON.parse(localStorage.getItem("log"));
  if (logs == null) {
    document.getElementById("result").innerHTML =
      "Your logs are only available as long as you don’t clear your browser cache.";
  } else {
    createListOfLogs(logs);
  }
} else {
  document.getElementById("result").innerHTML =
    "Sorry, your browser does not support Web Storage.";
}

function getLog(error, sucess2, iota) {
  if (error) {
    console.log(error);
  } else {
    var message = sucess2[0].signatureMessageFragment;
    message = message.split(
      "99999999999999999999999999999999999999999999999999"
    )[0];
    var obj = JSON.parse(iota.utils.fromTrytes(message));
    if (
      verification(
        obj.fileId + obj.time + obj.gateway + obj.isUpload + obj.encrypted,
        obj.signature
      )
    ) {
      return obj;
    } else {
      console.log("Wrong Signature");
    }
  }
}
