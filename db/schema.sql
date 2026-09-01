CREATE TABLE IF NOT EXISTS category (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES category (category_id),
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS device_session (
  session_id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  datetime_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS address (
  address_id SERIAL PRIMARY KEY,
  barangay VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL DEFAULT 'Philippines',
  longitude NUMERIC(10, 7),
  latitude NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS srp (
  srp_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product (product_id),
  price NUMERIC(12, 2) NOT NULL,
  effective_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS report (
  report_id SERIAL PRIMARY KEY,
  address_id INTEGER NOT NULL REFERENCES address (address_id),
  session_id INTEGER NOT NULL REFERENCES device_session (session_id),
  product_id INTEGER NOT NULL REFERENCES product (product_id),
  price NUMERIC(12, 2) NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  date_reported TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_rating (
  trust_id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES report (report_id),
  session_id INTEGER NOT NULL REFERENCES device_session (session_id),
  rating NUMERIC(3, 2) NOT NULL,
  description VARCHAR(255),
  date_rated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_log (
  log_id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES device_session (session_id),
  action VARCHAR(255) NOT NULL,
  action_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
