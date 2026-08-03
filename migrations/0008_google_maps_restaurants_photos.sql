UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' WHERE food_type = 'Kebap' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' WHERE food_type = 'Ev Yemekleri' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400' WHERE food_type = 'Balık' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400' WHERE food_type = 'Kahvaltı' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' WHERE food_type = 'Tatlı' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' WHERE food_type = 'Dünya Mutfağı' AND id LIKE 'gm-%';
UPDATE restaurants SET photo_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' WHERE food_type IN ('Diğer', 'Fast Food', 'Pide & Lahmacun') AND id LIKE 'gm-%';
