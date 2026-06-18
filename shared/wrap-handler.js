'use strict';

/**
 * Advanced IO shim — adapts the native (req, res) contract of
 * zcatalyst-sdk-node v3+ to the legacy (context, basicIO) handler API.
 *
 * - The `context` passed to the handler is the native IncomingMessage,
 *   valid for `catalyst.initialize(context)`.
 * - Body is parsed in BINARY mode (raw Buffer): parsing as UTF-8 string
 *   corrupts multipart/binary payloads (e.g. audio uploads).
 */

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      if (!raw.length) return resolve(null);
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          return resolve(JSON.parse(raw.toString('utf8')));
        } catch (_) {
          return resolve(raw.toString('utf8'));
        }
      }
      if (contentType.startsWith('text/')) return resolve(raw.toString('utf8'));
      resolve(raw); // binary payloads stay as Buffer
    });
  });
}

function wrapHandler(handler) {
  return async (req, res) => {
    const body = await parseBody(req);
    let statusCode = 200;
    const headers = {};

    const basicIO = {
      getRequestMethod: () => req.method,
      getRequestPath: () => {
        const raw = (req.url || '').split('?')[0];
        // Strip the /server/<function-name> prefix injected by Catalyst
        // routing (applies both in `catalyst serve` and production).
        return raw.replace(/^\/server\/[^/]+/, '') || '/';
      },
      getRequestHeader: (name) => (req.headers || {})[String(name).toLowerCase()] || null,
      getRequestBody: () => body,
      setResponseCode: (code) => { statusCode = code; },
      setResponseHeader: (key, value) => { headers[key] = value; },
      sendResponse: (data) => {
        let payload = data;
        if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
          payload = JSON.stringify(data);
          if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
        }
        res.writeHead(statusCode, headers);
        res.end(payload);
      },
    };

    try {
      await handler(req, basicIO);
    } catch (err) {
      console.error('[wrap-handler] Unhandled error:', JSON.stringify({
        message: err.message,
        timestamp: new Date().toISOString(),
      }));
      if (!res.writableEnded) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
      }
    }
  };
}

module.exports = { wrapHandler, parseBody };
