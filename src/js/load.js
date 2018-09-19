"use strict";
const MIME = require("mime/lite");
require("fast-text-encoding");
require("./alert");
require("./url-parameters");
import { saveAs } from "./file-saver";
import "../css/style.css";
import "../css/alert.css";

let ipfsgate = "https://untangle.care/ipfs/";

var subtle = null;
if (window.msCrypto) {
  subtle = window.msCrypto.subtle;
}
// If other browsers then...
else if (window.crypto) {
  subtle = window.crypto.subtle || window.crypto.webkitSubtle;
}

function output(msg) {
  let m = document.getElementById("messages");
  m.innerHTML = msg;
}

function progressBar(percent) {
  let elem = document.getElementById("loadBar");
  elem.style.width = percent + "%";
  if (percent >= 100) {
    document.getElementById("loadProgress").style.display = "none";
  }
}

function decrypt(initialVector, key, fileArray) {
  return subtle.decrypt(
    {
      name: "AES-GCM",
      iv: initialVector,
      tagLength: 128 //The tagLength you used to encrypt (if any)
    },
    key, //from generateKey or importKey above
    fileArray.buffer
  );
}

function iotaApiPost(fileHash) {
  storeLog(fileHash);
  const http = new XMLHttpRequest();
  const url =
    "https://pksuxqpp7d.execute-api.eu-central-1.amazonaws.com/latest/api/iota";
  const params = {
    hash: fileHash,
    upload: false,
    gateway: "https://untangle.care/ipfs/"
  };
  http.open("POST", url, true);
  http.setRequestHeader("Content-type", "application/json");
  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
      console.log(http.responseText);
    }
  };
  http.send(JSON.stringify(params));
}

function importKey(password) {
  return subtle.importKey(
    "jwk", //can be "jwk" or "raw"
    {
      kty: "oct",
      k: password,
      alg: "A256GCM",
      ext: true
    },
    {
      name: "AES-GCM",
      length: 256
    },
    true, //whether the key is extractable (i.e. can be used in exportKey)
    ["encrypt", "decrypt"]
  );
}

function storeLog(hash) {
  var logs = JSON.parse(localStorage.getItem("log"));
  console.log(logs);
  alert(hash);
  logs.push(hash);
  localStorage.setItem("log", JSON.stringify(logs));
}

function load() {
  console.time("load");
  let password = document.getElementById("passwordField").value;
  let fileId = document.getElementById("firstField").value;
  if (fileId.length != 46) {
    output("You have entered an invalid filename!");
  } else if (password.length != 43 && password !== "nopass") {
    output("You have entered an invalid password!");
  } else {
    if (!/^[a-zA-Z0-9_.-]*$/.test(password)) {
      output("You have entered an invalid password!");
    } else if (!/^[a-zA-Z0-9]*$/.test(fileId)) {
      output("You have entered an invalid filename!");
    } else {
      output("");
      var oReq = new XMLHttpRequest();
      document.getElementById("response").classList.remove("hidden");
      oReq.onloadstart = function(e) {
        document.getElementById("loadProgress").style.display = "block";
      };
      oReq.onload = function(oEvent) {
        const arrayBuffer = oReq.response;
        const fileNameLength =
          new TextDecoder("utf-8").decode(arrayBuffer.slice(0, 4)) - 1000;
        const fileName = new TextDecoder("utf-8").decode(
          arrayBuffer.slice(4, fileNameLength + 4)
        );

        // encrypted
        if (password !== "nopass") {
          console.log("passdownload");
          let initialVector = new Uint8Array(
            arrayBuffer.slice(4 + fileNameLength, 16 + fileNameLength)
          );
          const fileArray = new Uint8Array(
            arrayBuffer.slice(16 + fileNameLength)
          );
          const keyPromise = importKey(password);
          keyPromise
            .then(function(key) {
              const decryptPromise = decrypt(initialVector, key, fileArray);
              decryptPromise
                .then(function(decrypted) {
                  let typeM = MIME.getType(fileName);
                  const blob = new Blob([decrypted], { type: typeM });
                  blob.name = fileName;
                  saveAs(blob, fileName);
                  iotaApiPost(fileId);
                })
                .catch(function(err) {
                  console.log("line 95: " + err);
                  output("You have entered an invalid password!");
                });
            })
            .catch(function(err) {
              console.log("line 62" + err);
              output("You have entered an invalid password!");
            });
        } else {
          console.log("no pass download");
          const fileArray = new Uint8Array(
            arrayBuffer.slice(4 + fileNameLength)
          );
          let typeM = MIME.getType(fileName);
          const blob = new Blob([fileArray], { type: typeM });
          blob.name = fileName;
          saveAs(blob, fileName);
        }
      };
      oReq.onprogress = function(e) {
        if (e.lengthComputable) {
          let per = Math.round((e.loaded * 100) / e.total);
          progressBar(per);
        }
      };
      oReq.onreadystatechange = function(oEvent) {
        // Ready State 4 = operation completed
        if (oReq.readyState === 4) {
          if (oReq.status !== 200) {
            console.log(oReq);
            console.log("Error", oReq.statusText);
            output("You have entered an invalid filename!");
          }
        }
      };

      if (document.getElementById("hiddenGateway").innerText !== "empty") {
        console.log(document.getElementById("hiddenGateway").innerText);
        ipfsgate = document.getElementById("hiddenGateway").innerText;
      }
      oReq.open("GET", ipfsgate + fileId, true);
      oReq.responseType = "arraybuffer";
      oReq.send();
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("load").onclick = load;
});
