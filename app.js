// Developed by Neocomplexx Group SA - www.neocomplexx.com (2018)
// https://jsonplaceholder.typicode.com - API for testing

// Code of the form (function() { /* code here */ })() is known as an "Immediately Invoked Function Expression". 
// It is frequently used to set up a closure, so you can define variables without polluting the global scope. 
(function() {

    // ***************************************************
    // APP data
    var app = {
        API_URL: "https://jsonplaceholder.typicode.com/posts",
        LOCAL_STORAGE_KEY: "example_data",
        rows: {},
        tableBody: document.querySelector('.body'),
        rowTemplate: document.querySelector('.rowTemplate'),
    };

    // ***************************************************
    // APP functions
    app.addRow = function(element) {
        var row = app.rows[element.id];
        if (!row) {
            var row = app.rowTemplate.cloneNode(true);
            row.querySelector('.id').textContent = element.id;
            row.querySelector('.userId').textContent = element.userId;
            row.querySelector('.title').textContent = element.title;
            row.querySelector('.body').textContent = element.body;
            app.rows[element.id] = row;

            row.removeAttribute('hidden');
            console.log("Adding row: " + row);
            app.tableBody.appendChild(row);
        }
    }

    app.online = function() {
        document.querySelector(".alert-danger").setAttribute('hidden','true');
        document.querySelector(".alert-success").removeAttribute('hidden');
    }

    app.offline = function() {
        document.querySelector(".alert-success").setAttribute('hidden','true');
        document.querySelector(".alert-danger").removeAttribute('hidden');
    }

    // ***************************************************
    // App Code

    // Warning: localStorage is a synchronous API - Please check out IndexedDB :)
    var oldData = localStorage.getItem(app.LOCAL_STORAGE_KEY)
    if (oldData) {
        // Show offline data
        console.log("Reading offline data...");
        oldData = JSON.parse(oldData);

        oldData.forEach(element => {
            app.addRow(element);
        });
        
    }

    // Fetching new data (100 items)
    fetch(app.API_URL)
        .then(response => response.json())
        .then(newData => {
            console.log("Reading online data...");
            // Save data on localstorage
            localStorage.setItem(app.LOCAL_STORAGE_KEY,JSON.stringify(newData));

            newData.forEach(element => {
                app.addRow(element);
            });
        });
    
    // ***************************************************
    // Events
    window.addEventListener('online', function(e) {
        app.online();
    }, false);
        
    window.addEventListener('offline', function(e) {
        app.offline();
    }, false);

    (navigator.onLine) ?  app.online() : app.offline();

    // ***************************************************
    // serviceWorker registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(() => { 
                console.log('Service Worker Registered'); 
            });
    }
})();