ALTER TABLE users
  ADD COLUMN can_access_calendar TINYINT(1) NOT NULL DEFAULT 1
  AFTER role;
