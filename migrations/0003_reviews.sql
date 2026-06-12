CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_by_avatar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_added_by ON reviews(added_by);
