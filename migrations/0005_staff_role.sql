UPDATE users SET role = 'staff' WHERE email LIKE '%@hakanismakinalari.com';
UPDATE users SET role = 'customer' WHERE role = 'member';
