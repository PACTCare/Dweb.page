// IndexedDB
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
dbVersion = 1;


// Create/open database
const request = indexedDB.open('elephantFiles', dbVersion);
request.onsuccess = function (event) {
  console.log('Success creating/accessing IndexedDB database');
  db = request.result;

  db.onerror = function (event) {
    console.log('Error creating/accessing IndexedDB database');
  };

  // Interim solution for Google Chrome to create an objectStore. Will be deprecated
  if (db.setVersion) {
    if (db.version != dbVersion) {
      const setVersion = db.setVersion(dbVersion);
      setVersion.onsuccess = function () {
        createObjectStore(db);
        getImageFile();
      };
    } else {
      getImageFile();
    }
  } else {
    getImageFile();
  }
};

// For future use. Currently only in latest Firefox versions
request.onupgradeneeded = function (event) {
  createObjectStore(event.target.result);
};
