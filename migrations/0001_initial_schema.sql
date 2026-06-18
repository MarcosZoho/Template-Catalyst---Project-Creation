-- 0001_initial_schema.sql
-- Documentation only — create manually in Catalyst Console → Data Store.
-- Base tables required by the template's core modules (see CLAUDE.md).

-- Seeder-generated records
CREATE TABLE AppData (
  reference_code VARCHAR(100), -- unique record identifier
  status         VARCHAR(50),  -- Active | Processed
  metadata       JSON          -- flexible metadata storage
);

-- Audit / event tracking
CREATE TABLE SystemLogs (
  event_type VARCHAR(50),      -- CRON | OCR | AUTH | ...
  payload    TEXT              -- technical detail or error trace
);

-- Push notification tokens
CREATE TABLE PushSubscriptions (
  user_id      VARCHAR(100),   -- authenticated user reference
  device_token TEXT,           -- push registration token
  platform     VARCHAR(20)     -- Web | iOS | Android
);
