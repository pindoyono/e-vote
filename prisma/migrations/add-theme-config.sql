-- Add theme configuration to configs table
INSERT OR IGNORE INTO configs (key, value, updatedAt) VALUES
    ('themePrimary', '#1e40af', datetime('now')),
    ('themeSecondary', '#3b82f6', datetime('now')),
    ('themeAccent', '#eab308', datetime('now')),
    ('themeSuccess', '#16a34a', datetime('now'));
