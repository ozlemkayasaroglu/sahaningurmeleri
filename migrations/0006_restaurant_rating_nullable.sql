-- Puanlama artık yalnızca reviews tablosundan (kullanıcıların yorumlarından) hesaplanıyor.
-- Restoran eklenirken zorunlu bir başlangıç puanı istenmiyor, bu yüzden rating nullable olmalı.
CREATE TABLE restaurants_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  food_type TEXT NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_by_avatar TEXT,
  added_by_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  lat REAL NOT NULL DEFAULT 0,
  lng REAL NOT NULL DEFAULT 0,
  photo_url TEXT
);

INSERT INTO restaurants_new SELECT
  id, name, city, district, food_type, rating, comment, added_by,
  added_by_avatar, added_by_id, created_at, lat, lng, photo_url
FROM restaurants;

DROP TABLE restaurants;
ALTER TABLE restaurants_new RENAME TO restaurants;

CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_added_by ON restaurants(added_by);
