const channel = new BroadcastChannel('sw-messages');
channel.addEventListener('message', e => {
    const data = e.data;
    if (!data) {
        return;
    }
    window.parent.postMessage(data, '*');
});

if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            if (registration.installing) {
                const sw = registration.installing || registration.waiting;
                sw.onstatechange = function() {
                    if (sw.state === 'installed') {
                        caches.keys().then(function(names) {
                            for (let name of names) {
                                caches.delete(name);
                            }
                            // SW installed.  Refresh page so SW can respond with SW-enabled page.
                            window.location.reload();
                        });
                    }
                };
            }
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
    });
} else {
    console.log('Service Worker not supported in this browser.');
}

window.onmessage = function(e) {
    const data = e.data;
    if (!data) {
        return;
    }
    if (data.messageType === 'file-response') {
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage(data);
        });
        return;
    }
    if (data.command === 'executeJs') {
        execJs(data.js, data.msgId);
    }
};


function removeServiceWorker() {
    if(window.navigator && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                console.log('Unregistering resgistration');
                registration.unregister();
            }
        });
    }
}