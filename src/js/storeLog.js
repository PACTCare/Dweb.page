if (typeof Storage !== "undefined") {
  console.log("storage works");
  // Code for localStorage/sessionStorage.
  // https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
  function storeLog(hash) {
    var logs = JSON.parse(localStorage.getItem("log"));
    console.log(logs);
    logs.push(hash);
    localStorage.setItem("log", JSON.stringify(logs));
  }

  document.getElementById("load").onclick = storeLog;
} else {
  console.log("Sorry! No Web Storage support.");
}
