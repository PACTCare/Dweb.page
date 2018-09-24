"use strict";

const _hash = new WeakMap();
const STORAGEKEY = "log";
const url =
  "https://pksuxqpp7d.execute-api.eu-central-1.amazonaws.com/latest/api/iota";

export class Log {
  constructor(hash) {
    _hash.set(this, hash);
  }

  localLogStorage(filename) {
    var logs = JSON.parse(window.localStorage.getItem(STORAGEKEY));
    if (logs == null) {
      logs = [];
      logs.push(_hash.get(this) + "&&&" + filename);
    } else {
      logs.push(_hash.get(this) + "&&&" + filename);
      // remove double entries
      logs = Array.from(new Set(logs));
    }

    console.log(logs);
    window.localStorage.setItem(STORAGEKEY, JSON.stringify(logs));
  }

  iotaApiPost(isUpload, gateway, isEncrypted) {
    const http = new XMLHttpRequest();
    const params = {
      hash: _hash.get(this),
      upload: isUpload,
      gateway: gateway,
      encrypted: isEncrypted
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
}
