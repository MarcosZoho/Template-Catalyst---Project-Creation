'use strict';

const { Readable } = require('stream');

// folder.uploadFile({ code }) requires a NAMED Readable stream (with .path
// set). Passing a raw Buffer omits the filename in Content-Disposition and
// Catalyst rejects the upload with "wrong format".
function bufferToNamedStream(buffer, filename) {
  const stream = Readable.from(buffer);
  stream.path = filename;
  return stream;
}

// folder.downloadFile(fileId) returns a ReadableStream, not a Buffer.
// Calling .length on the stream breaks the download.
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = { bufferToNamedStream, streamToBuffer };
