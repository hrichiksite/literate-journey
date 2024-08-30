const { parentPort } = require('worker_threads');
const { MeiliSearch } = require('meilisearch'); // or require the appropriate client library

// Initialize the client
const client = new MeiliSearch({
    host: 'http://127.0.0.1:7700', // Replace with your MeiliSearch host
});

parentPort.on('message', (line) => {
    const work = line.split('\t');
    const parsed = JSON.parse(work[4]);
    client.index('books').addDocuments([{
        id: work[1].replace('/works/', ''),
        type: work[0],
        revision: work[2],
        title: parsed.title,
        authors: parsed.authors,
        poster: parsed.covers ? `https://covers.openlibrary.org/b/id/${parsed.covers[0]}-M.jpg` : undefined,
    }]).then((response) => {
        parentPort.postMessage({ success: true, response });
    }).catch((error) => {
        parentPort.postMessage({ success: false, error });
    });
});