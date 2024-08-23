// service-worker.js

let idCounter = 0;
const promiseStorage = {};

const channel = new BroadcastChannel('sw-messages');

addEventListener("message", (e) => {
    const data = e.data;
    if (!data) {
        return;
    }
    if (data.messageType === 'file-response') {
        const headers = new Headers({
            'Content-Type': data.contentType
        });

        // Resolve the promise with the generated response
        promiseStorage[data.requestId].resolve(new Response(data.content, { headers: headers }));
    }
});

// Your custom fetch logic function
async function customFetchLogic(event) {
    const request = event.request;
    if (request.url.endsWith('/vscode-opensilver-3000/') ||
        request.url.endsWith('/vscode-opensilver-3000') ||
        request.url.endsWith('/app.js') ||
        request.url.endsWith('/service-worker.js') ||
        request.url.endsWith('/favicon.ico')) {
        try {
            const response = await fetch(request);
            return response;
        } catch (error) {
            console.error('[Service Worker] Error during custom fetch:', error);
            throw error;
        }
    }

    //console.log('[Service Worker] Custom logic for:', request.url);
    const id = (idCounter++).toString();

    const promise = new Promise((resolve, reject) => {
        promiseStorage[id] = { resolve: resolve, reject: reject };
    });

    const msg = {
        messageType: 'load-file',
        requestId: id,
        url: request.url
    };
    channel.postMessage(msg);
    return promise;
}

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker ...', event);
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        customFetchLogic(event)
            .then((response) => response)
            .catch((error) => {
                console.error('[Service Worker] Fetch failed:', error);
                // Optionally, return a fallback response or error page
                return new Response('Fetch failed', { status: 500 });
            })
    );
});
