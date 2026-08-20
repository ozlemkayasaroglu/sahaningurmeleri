CREATE TABLE IF NOT EXISTS review_replies (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_by_avatar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);
