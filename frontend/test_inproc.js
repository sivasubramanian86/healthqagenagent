(async () => {
  // Start the app in-process on an ephemeral port and run tests against it.
  const app = require('./mock-server');
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    console.log('In-process mock server listening on', base);

    const fetch = global.fetch || (await import('node-fetch')).default;

    async function fetchAndHandle(path) {
      try {
        const res = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        console.log(`\nRequest to ${path} - status: ${res.status}`);
        if (!res.ok) {
          const text = await res.text();
          console.log(`Handled server error: ${text}`);
          return;
        }
        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.log(`Handled non-JSON response: ${text}`);
            return;
          }
        }
        console.log('Parsed JSON:', data);
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    }

    await fetchAndHandle('/api/generate-tests');
    await fetchAndHandle('/api/error-text');

    server.close(() => {
      console.log('Server closed');
    });
  });
})();
