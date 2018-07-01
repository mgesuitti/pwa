// Developed by Neocomplexx Group SA - www.neocomplexx.com (2018)
// https://jsonplaceholder.typicode.com - API for testing

// Code of the form (function() { /* code here */ })() is known as an "Immediately Invoked Function Expression". 
// It is frequently used to set up a closure, so you can define variables without polluting the global scope. 
(function () {

    // ***************************************************
    // APP data
    var app = {
        API_URL: "https://jsonplaceholder.typicode.com/posts",
        LOCAL_STORAGE_KEY: "example_data",
        rows: {},
        tableBody: document.querySelector('.tableBody'),
        rowTemplate: document.querySelector('.rowTemplate'),
    };

    /**
     * Add row to HTML table
     * @param {*} element 
     */
    app.addRow = function (element) {
        var row = app.rows[element.id];
        if (!row) {
            var row = app.rowTemplate.cloneNode(true);
            row.querySelector('.id').textContent = element.id;
            row.querySelector('.userId').textContent = element.userId;
            row.querySelector('.title').textContent = element.title;
            row.querySelector('.body').textContent = element.body;
            app.rows[element.id] = row;

            row.removeAttribute('hidden');
            app.tableBody.appendChild(row);
        }
    }

    app.addRows= function (data) {
        data.forEach(element => {
            app.addRow(element);
        });
    }

    /**
     * Save data to localstorage
     * @param {*} newData 
     */
    app.saveData = function (newData) {
        localStorage.setItem(app.LOCAL_STORAGE_KEY, JSON.stringify(newData));
    }

    /**
     * Load offline data from localStorage
     * Warning: localStorage is a synchronous API, please check out IndexedDB :)
     */
    app.loadData = function () {
        var oldData = localStorage.getItem(app.LOCAL_STORAGE_KEY)
        if (oldData) {
            console.log("[APP] Showing offline data...");
            oldData = JSON.parse(oldData);

            oldData.forEach(element => {
                app.addRow(element);
            });
        }
    }

    /**
     * online event
     */
    app.online = function () {
        document.querySelector(".alert-danger").setAttribute('hidden', 'true');
        document.querySelector(".alert-success").removeAttribute('hidden');
    }

    /**
     * offline event
     */
    app.offline = function () {
        document.querySelector(".alert-success").setAttribute('hidden', 'true');
        document.querySelector(".alert-danger").removeAttribute('hidden');
    }

    app.showLoader = function () {
        document.querySelector(".loader").removeAttribute('hidden');
    }

    app.hideLoader = function () {
        document.querySelector(".loader").setAttribute('hidden', 'true');
    }

    /**
     * The App Code
     * "Cache then network" strategy
     */
    app.init = function () {
        var networkDataReceived = false;
        app.showLoader();

        // Fetch new data from network
        var networkUpdate = fetch(app.API_URL)
            .then(response => response.json())
            .then(newData => {
                console.log("[APP] Showing online data...");
                networkDataReceived = true;
                // app.saveData(newData); // To LocalStorage
                app.addRows(newData);
            });
        
        // app.loadData(); // From localStorage
        if ('caches' in window) {
            // Fetch from cacheStorage
            caches.match(app.API_URL)
                .then(response => response.json())
                .then(oldData => {
                    // don't overwrite newer network data
                    if (!networkDataReceived) {
                        console.log("[APP] Showing offline data...");
                        app.addRows(oldData);
                    }
                })
                .catch(() => networkUpdate)
                .catch(() => console.log("[APP] We didn't get cached or online data"))
                .then(() => app.hideLoader());
        }
    }

    // ***************************************************
    // Events binding
    window.addEventListener('online', event => {
        app.online();
    });

    window.addEventListener('offline', event => {
        app.offline();
    });

    (navigator.onLine) ? app.online() : app.offline();

    app.init();

    // ***************************************************
    // serviceWorker registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(() => {
                console.log('[APP] Service Worker Registered');
            });
    }

})();