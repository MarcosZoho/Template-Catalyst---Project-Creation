'use strict';

// Skeleton advancedio function (Express). Before `catalyst serve` or deploy,
// run ./scripts/copy-shared.sh so ./shared exists inside this function —
// Catalyst CLI does not package parent dirs nor follow symlinks.
const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { dsShim } = require('./shared/ds-shim');

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

app.post('/api/example', async (req, res) => {
  try {
    const capp = catalyst.initialize(req);

    // Public users lack DataStore write privileges — elevate ONCE and keep it.
    // strictScope=true blocks the SDK's per-request switchUser('user') override;
    // switchUser('admin') alone is silently reverted on every HTTP request.
    capp.credential.switchUser('admin');
    capp.credential.strictScope = true;

    const ds = dsShim(capp);
    const rows = await ds.table('AppData').getTableRows({ limit: 10 });

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[func_name][/api/example] Error:', JSON.stringify({
      message: err.message,
      timestamp: new Date().toISOString(),
    }));
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = app;
