// Durable storage for the SQLite database that runs inside the WebAssembly runtime.
//
// SQLite reads and writes an ordinary file, but in the browser that file lives in Emscripten's
// in-memory file system and is gone the moment the page reloads. HMS.Platform.OpenSilver's
// BrowserDatabaseStore mirrors the file here, base64 encoded, after every save.

(function () {
    'use strict';

    var DB_NAME = 'hms';
    var DB_VERSION = 1;
    var STORE_NAME = 'files';
    var KEY = 'testHospital.db';

    function openDatabase() {
        return new Promise(function (resolve, reject) {
            var request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = function () {
                request.result.createObjectStore(STORE_NAME);
            };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error); };
        });
    }

    function read(db) {
        return new Promise(function (resolve, reject) {
            var request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(KEY);
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error); };
        });
    }

    function write(db, value) {
        return new Promise(function (resolve, reject) {
            var transaction = db.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).put(value, KEY);
            transaction.oncomplete = function () { resolve(); };
            transaction.onerror = function () { reject(transaction.error); };
            transaction.onabort = function () { reject(transaction.error); };
        });
    }

    window.hmsSqlite = {
        // Yields the stored database as base64, or an empty string when nothing is stored yet.
        load: function (onResult, onError) {
            openDatabase()
                .then(read)
                .then(function (value) { onResult(value == null ? '' : value); })
                .catch(function (error) { onError(String(error)); });
        },

        save: function (base64, onDone, onError) {
            openDatabase()
                .then(function (db) { return write(db, base64); })
                .then(function () { onDone(); })
                .catch(function (error) { onError(String(error)); });
        }
    };
})();
