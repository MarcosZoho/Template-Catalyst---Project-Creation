'use strict';

/**
 * Data Store compatibility shim for zcatalyst-sdk-node v3+.
 *
 * v3 removed `table.getTableRows()` / `table.getTableRow()`. This shim
 * restores them via ZCQL and `getRow()`, and handles two platform quirks:
 *
 * 1. ZCQL returns the first element as a column-metadata row where every
 *    key equals its value (e.g. { status: "status" }) — must be discarded.
 * 2. `getRow(id)` returns `{ TableName: {...} }` (wrapped) and does NOT
 *    guarantee the presence of ROWID in the result.
 *
 * Remember: ZCQL returns ALL numeric fields as strings — coerce with
 * Number() before any numeric comparison. ROWIDs exceed
 * Number.MAX_SAFE_INTEGER — keep them as strings end-to-end.
 */

const isHeaderRow = (row) => row && typeof row === 'object'
  && Object.keys(row).length > 0
  && Object.entries(row).every(([key, value]) => key === value);

function dsShim(app) {
  const zcql = app.zcql();
  const datastore = app.datastore();

  return {
    async query(zcqlQuery) {
      const rows = await zcql.executeZCQLQuery(zcqlQuery);
      return (rows || []).filter((row) => !isHeaderRow(row));
    },

    table(tableName) {
      const table = datastore.table(tableName);
      return {
        async getTableRows({ select = '*', criteria = '', limit = 300 } = {}) {
          const where = criteria ? ` WHERE ${criteria}` : '';
          const rows = await zcql.executeZCQLQuery(
            `SELECT ${select} FROM ${tableName}${where} LIMIT ${limit}`
          );
          return (rows || [])
            .map((row) => row[tableName] || row)
            .filter((row) => !isHeaderRow(row));
        },

        async getTableRow(id) {
          const row = await table.getRow(id);
          if (!row) return null;
          const flat = row[tableName] || row;
          // getRow does not guarantee ROWID presence — restore it as string
          if (!flat.ROWID) flat.ROWID = String(id);
          return flat;
        },

        insertRow: (data) => table.insertRow(data),
        updateRow: (data) => table.updateRow(data),
        deleteRow: (id) => table.deleteRow(id),
      };
    },
  };
}

module.exports = { dsShim, isHeaderRow };
