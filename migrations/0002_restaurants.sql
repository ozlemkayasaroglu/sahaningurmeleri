CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  food_type TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_by_avatar TEXT,
  added_by_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  lat REAL NOT NULL DEFAULT 0,
  lng REAL NOT NULL DEFAULT 0,
  photo_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_added_by ON restaurants(added_by);

INSERT OR IGNORE INTO restaurants (
  id,
  name,
  city,
  district,
  food_type,
  rating,
  comment,
  added_by,
  added_by_avatar,
  added_by_id,
  created_at,
  lat,
  lng,
  photo_url
) VALUES
  (
    '1',
    'Beyti Restaurant',
    'İstanbul',
    'Florya',
    'Kebap',
    5,
    'Efsanevi Beyti kebabı! Müşteri toplantıları için ideal, servis çok profesyonel.',
    'Ahmet Yılmaz',
    NULL,
    NULL,
    '2024-01-15T10:30:00Z',
    40.9761,
    28.7894,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'
  ),
  (
    '2',
    'Çiya Sofrası',
    'İstanbul',
    'Kadıköy',
    'Ev Yemekleri',
    5,
    'Anadolu mutfağının en iyisi. Her gün değişen menü, ev yapımı tatlar.',
    'Elif Kaya',
    NULL,
    NULL,
    '2024-01-14T12:00:00Z',
    40.9903,
    29.0289,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
  ),
  (
    '3',
    'İmam Çağdaş',
    'Gaziantep',
    'Şahinbey',
    'Kebap',
    5,
    'Antep mutfağının kalbi! Lahmacun ve kebap seçenekleri muhteşem.',
    'Mehmet Demir',
    NULL,
    NULL,
    '2024-01-12T14:30:00Z',
    37.0662,
    37.3833,
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400'
  ),
  (
    '4',
    'Tarihi Süleymaniye Hamamı Restoran',
    'İstanbul',
    'Fatih',
    'Ev Yemekleri',
    4,
    'Kuru fasulye pilav efsanesi! Hızlı öğle yemeği için mükemmel.',
    'Zeynep Arslan',
    NULL,
    NULL,
    '2024-01-10T11:00:00Z',
    41.0162,
    28.9639,
    NULL
  );
