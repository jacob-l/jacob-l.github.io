self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

async function sha1(message) {
    // encode as (utf-8) Uint8Array
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

self.addEventListener('fetch', (e) => {
    var scope = e.currentTarget.registration.scope;
    console.log(scope);
    var url = new URL(e.request.url);

    if (e.request.url === scope || e.request.url + '/' === scope) {
        e.respondWith(
            fetch(e.request).then((response) => {
                return response;
            })
        );
        return;
    }

    var pathname = '/' + (url.origin + url.pathname).replace(scope, '');
    console.log(pathname);
    // Respond with the new request
    e.respondWith(sha1(pathname).then(urlHash => {
        // Create a new URL
        const newURL = e.request.url.replace(pathname, '/' + urlHash.substring(0,6) + '.x');

        console.log('UPDATED URL - ' + newURL);

        // Create a new request with the new URL
        const newRequest = new Request(newURL, {
          method: e.request.method,
          headers: e.request.headers,
          mode: e.request.mode,
          credentials: e.request.credentials,
          redirect: e.request.redirect
        });

        return fetch(newRequest).then(function(response) {
            // Clone the response to modify headers
            var responseClone = response.clone();

            // Get existing headers
            var headers = new Headers(responseClone.headers);

            // Determine content type based on the requested file's extension
            var url = new URL(e.request.url);
            var extension = url.pathname.split('.').pop();
      
            var contentType = 'text/plain'; // Default content type
            if (extension === 'css') {
                contentType = 'text/css';
            } else if (extension === 'js') {
                contentType = 'application/javascript';
            } else if (extension === 'json') {
                contentType = 'application/json';
            } else if (extension === 'png') {
                contentType = 'image/png';
            } else if (extension === 'jpg' || extension === 'jpeg') {
                contentType = 'image/jpeg';
            } else if (extension === 'wasm') {
                contentType = 'application/wasm';
            } else if (extension === 'blat' || extension === 'dll' || extension === 'dat') {
                contentType = 'application/octet-stream';
            } else if (extension === 'woff' || extension === 'woff2') {
                contentType = 'application/font-woff';
            }

            // Add or override the 'Content-Type' header
            headers.set('Content-Type', contentType);

            // Create a new response with the modified headers
            var modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });

            return modifiedResponse;
        });
    }));

/*
    // Check if the current request URL needs to be changed
    if (e.request.url.includes('OpenSilver.dll')) {
        // Create a new URL
        const newURL = e.request.url.replace('OpenSilver.dll', 'short.bin');

        // Create a new request with the new URL
        const newRequest = new Request(newURL, {
          method: e.request.method,
          headers: e.request.headers,
          mode: e.request.mode,
          credentials: e.request.credentials,
          redirect: e.request.redirect
        });

        // Respond with the new request
        e.respondWith(fetch(newRequest));
    } else {

        e.respondWith(
            fetch(e.request).then((response) => {
                return response;
            })
        );
    }*/
});