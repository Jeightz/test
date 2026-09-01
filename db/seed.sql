INSERT INTO category (name) VALUES
  ('Basic Necessities'),
  ('Prime Commodities'),
  ('Uncategorized')
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT 'Well-milled rice (per kg)', category_id FROM category WHERE name = 'Basic Necessities'
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT 'Regular-milled rice (per kg)', category_id FROM category WHERE name = 'Basic Necessities'
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT 'Eggs (per piece)', category_id FROM category WHERE name = 'Basic Necessities'
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT 'Refined sugar (per kg)', category_id FROM category WHERE name = 'Prime Commodities'
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT 'Cooking oil (per liter)', category_id FROM category WHERE name = 'Prime Commodities'
ON CONFLICT (name) DO NOTHING;

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, 58.00, DATE '2026-08-01'
FROM product p
WHERE p.name = 'Well-milled rice (per kg)'
  AND NOT EXISTS (
    SELECT 1 FROM srp s WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
  );

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, 50.00, DATE '2026-08-01'
FROM product p
WHERE p.name = 'Regular-milled rice (per kg)'
  AND NOT EXISTS (
    SELECT 1 FROM srp s WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
  );

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, 8.00, DATE '2026-08-01'
FROM product p
WHERE p.name = 'Eggs (per piece)'
  AND NOT EXISTS (
    SELECT 1 FROM srp s WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
  );

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, 70.00, DATE '2026-08-01'
FROM product p
WHERE p.name = 'Refined sugar (per kg)'
  AND NOT EXISTS (
    SELECT 1 FROM srp s WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
  );

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, 90.00, DATE '2026-08-01'
FROM product p
WHERE p.name = 'Cooking oil (per liter)'
  AND NOT EXISTS (
    SELECT 1 FROM srp s WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
  );
