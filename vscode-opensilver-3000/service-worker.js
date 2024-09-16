let idCounter = 0;
const promiseStorage = {};

const channel = new BroadcastChannel('sw-messages');

addEventListener("message", (e) => {
    const data = e.data;
    if (!data) {
        return;
    }
    if (data.command === 'file-response') {
        const headers = new Headers({
            'Content-Type': data.contentType
        });

        // Resolve the promise with the generated response
        promiseStorage[data.requestId].resolve(new Response(data.content, {
            headers: headers,
            status: data.status || 200
        }));
        delete promiseStorage[data.requestId];
    }
});

// Your custom fetch logic function
async function customFetchLogic(event) {
    const request = event.request;
    const url = new URL(request.url);
    const basePath = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);
    if (!request.url.startsWith(self.location.origin) ||
        url.pathname === basePath || url.pathname === `${basePath}index.html`) {
        try {
            const response = await fetch(request);
            return response;
        } catch (error) {
            console.error('[Service Worker] Error during custom fetch:', error);
            throw error;
        }
    }
    const id = (idCounter++).toString();

    const promise = new Promise((resolve, reject) => {
        promiseStorage[id] = { resolve: resolve, reject: reject };
    });

    const msg = {
        command: 'load-file',
        requestId: id,
        url: request.url
    };
    channel.postMessage(msg);
    return promise;
}

self.addEventListener('activate', (event) => {
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
