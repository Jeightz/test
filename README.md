# PRICETER

Crowdsourced price verification for local consumers. No login or registration.

## Stack

- React
- Next.js
- PostgreSQL
- JavaScript

## Setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.

Local peer authentication (no password):

```
DATABASE_URL=postgresql:///priceter?host=/var/run/postgresql
```

Password authentication:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/priceter
```

2. Create a PostgreSQL role and database if they do not exist yet:

```bash
sudo -u postgres createuser -s jay
sudo -u postgres createdb priceter
```

3. Install packages and load the schema:

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core features

- Search products
- Anonymous price reports with photo, price, and location
- Product details
- Current DTI SRP
- Fair / High / Overpriced indicator
- Local median (nearby, barangay, city)
- Community trust score
- Daily limits on reporting and rating
