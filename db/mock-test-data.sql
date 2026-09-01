-- =============================================================================
-- MOCK / TEST DATA ONLY
-- These SRP values and reports are for development and testing.
-- They are NOT official current DTI Suggested Retail Prices.
-- =============================================================================

INSERT INTO category (name) VALUES
  ('Rice'),
  ('Meat'),
  ('Vegetables'),
  ('Canned Goods'),
  ('Beverages'),
  ('Other Common Products')
ON CONFLICT (name) DO NOTHING;

INSERT INTO product (name, category_id)
SELECT v.name, c.category_id
FROM (
  VALUES
    ('Well-milled rice (per kg)', 'Rice'),
    ('Regular-milled rice (per kg)', 'Rice'),
    ('Glutinous rice (per kg)', 'Rice'),
    ('Pork liempo (per kg)', 'Meat'),
    ('Chicken whole (per kg)', 'Meat'),
    ('Beef stew meat (per kg)', 'Meat'),
    ('Cabbage (per kg)', 'Vegetables'),
    ('Tomato (per kg)', 'Vegetables'),
    ('Onion (per kg)', 'Vegetables'),
    ('Potato (per kg)', 'Vegetables'),
    ('Sardines in tomato sauce (155g)', 'Canned Goods'),
    ('Corned beef (150g)', 'Canned Goods'),
    ('Canned tuna flakes (155g)', 'Canned Goods'),
    ('Fresh milk (1 liter)', 'Beverages'),
    ('3-in-1 coffee (10 sachets)', 'Beverages'),
    ('Bottled water (1 liter)', 'Beverages'),
    ('Instant noodles (pack)', 'Other Common Products'),
    ('Loaf bread (400g)', 'Other Common Products'),
    ('Eggs (per piece)', 'Other Common Products'),
    ('Refined sugar (per kg)', 'Other Common Products'),
    ('Cooking oil (per liter)', 'Other Common Products')
) AS v(name, category_name)
JOIN category c ON c.name = v.category_name
ON CONFLICT (name) DO NOTHING;

INSERT INTO srp (product_id, price, effective_date)
SELECT p.product_id, v.price, DATE '2026-08-01'
FROM (
  VALUES
    ('Well-milled rice (per kg)', 58.00),
    ('Regular-milled rice (per kg)', 50.00),
    ('Glutinous rice (per kg)', 75.00),
    ('Pork liempo (per kg)', 280.00),
    ('Chicken whole (per kg)', 200.00),
    ('Beef stew meat (per kg)', 380.00),
    ('Cabbage (per kg)', 45.00),
    ('Tomato (per kg)', 60.00),
    ('Onion (per kg)', 70.00),
    ('Potato (per kg)', 80.00),
    ('Sardines in tomato sauce (155g)', 23.00),
    ('Corned beef (150g)', 38.00),
    ('Canned tuna flakes (155g)', 32.00),
    ('Fresh milk (1 liter)', 95.00),
    ('3-in-1 coffee (10 sachets)', 68.00),
    ('Bottled water (1 liter)', 20.00),
    ('Instant noodles (pack)', 12.00),
    ('Loaf bread (400g)', 55.00),
    ('Eggs (per piece)', 8.00),
    ('Refined sugar (per kg)', 70.00),
    ('Cooking oil (per liter)', 90.00)
) AS v(name, price)
JOIN product p ON p.name = v.name
WHERE NOT EXISTS (
  SELECT 1 FROM srp s
  WHERE s.product_id = p.product_id AND s.effective_date = DATE '2026-08-01'
);

INSERT INTO device_session (token)
VALUES ('mock-test-session-priceter')
ON CONFLICT (token) DO NOTHING;

INSERT INTO address (barangay, city, country, longitude, latitude)
SELECT 'Magugpo Poblacion', 'Tagum', 'Philippines', 125.8072000, 7.4479000
WHERE NOT EXISTS (
  SELECT 1 FROM address
  WHERE barangay = 'Magugpo Poblacion' AND city = 'Tagum' AND latitude = 7.4479000
);

INSERT INTO address (barangay, city, country, longitude, latitude)
SELECT 'Visayan Village', 'Tagum', 'Philippines', 125.8120000, 7.4520000
WHERE NOT EXISTS (
  SELECT 1 FROM address
  WHERE barangay = 'Visayan Village' AND city = 'Tagum' AND latitude = 7.4520000
);

-- Indicator test reports (MOCK):
-- Fair / LOW: reports at or below 105% of mock SRP
-- High: reports between 105% and 120% of mock SRP
-- Overpriced: reports above 120% of mock SRP
INSERT INTO report (address_id, session_id, product_id, price, photo_url)
SELECT a.address_id, d.session_id, p.product_id, v.price, '/img/b15b52ed644cb8bf9933d79ba785a2d3.jpg'
FROM (
  VALUES
    -- Fair product median: Well-milled rice SRP 58, reports 54/56/58 -> median 56 (Fair)
    ('Well-milled rice (per kg)', 54.00, 'Magugpo Poblacion'),
    ('Well-milled rice (per kg)', 56.00, 'Magugpo Poblacion'),
    ('Well-milled rice (per kg)', 58.00, 'Visayan Village'),
    -- High product median: Pork liempo SRP 280, reports 310/320/330 -> median 320 (High)
    ('Pork liempo (per kg)', 310.00, 'Magugpo Poblacion'),
    ('Pork liempo (per kg)', 320.00, 'Magugpo Poblacion'),
    ('Pork liempo (per kg)', 330.00, 'Visayan Village'),
    -- Overpriced product median: Instant noodles SRP 12, reports 16/18/22 -> median 18 (Overpriced)
    ('Instant noodles (pack)', 16.00, 'Magugpo Poblacion'),
    ('Instant noodles (pack)', 18.00, 'Magugpo Poblacion'),
    ('Instant noodles (pack)', 22.00, 'Visayan Village'),
    -- Mixed per-report states on one product (Chicken SRP 200):
    -- 195 Fair, 230 High, 260 Overpriced; product median 230 = High
    ('Chicken whole (per kg)', 195.00, 'Magugpo Poblacion'),
    ('Chicken whole (per kg)', 230.00, 'Visayan Village'),
    ('Chicken whole (per kg)', 260.00, 'Magugpo Poblacion'),
    -- Extra search/filter coverage
    ('Tomato (per kg)', 58.00, 'Magugpo Poblacion'),
    ('Cabbage (per kg)', 42.00, 'Visayan Village'),
    ('Sardines in tomato sauce (155g)', 22.00, 'Magugpo Poblacion'),
    ('Fresh milk (1 liter)', 110.00, 'Visayan Village'),
    ('Eggs (per piece)', 8.00, 'Magugpo Poblacion'),
    ('Cooking oil (per liter)', 118.00, 'Visayan Village')
) AS v(product_name, price, barangay)
JOIN product p ON p.name = v.product_name
JOIN address a ON a.barangay = v.barangay AND a.city = 'Tagum'
JOIN device_session d ON d.token = 'mock-test-session-priceter'
WHERE NOT EXISTS (
  SELECT 1
  FROM report r
  WHERE r.session_id = d.session_id
    AND r.product_id = p.product_id
    AND r.price = v.price
);
