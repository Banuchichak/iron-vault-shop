# Iron Vault – Full-Stack E-Commerce Web Application

A full-stack CRUD web application built with **Node.js, Express, MySQL and MongoDB**, developed as a Web Development course project. It simulates an online store with a customer side (browse, cart, checkout, reviews) and an admin dashboard (products, users, orders).

> **Academic project.** The product catalogue is fictional sample data. There are no real payments, orders or inventory.

## Features

**Customers**
- Register, log in, edit profile and change password
- Browse the catalogue with filtering and sorting (name, rating, category, price, date)
- Shopping cart (session-based), checkout and order history
- Star ratings and written reviews

**Administrators**
- Dashboard with live statistics: products, users, orders, revenue, pending orders
- Full product management (create, edit, deactivate) with images, tags and specifications
- User management and order status workflow (pending → confirmed → processing → shipped → delivered / cancelled)

## Tech stack

| Layer | Technology |
|---|---|
| Runtime / framework | Node.js 18+, Express 4 |
| Templating | EJS (server-side rendering) |
| Relational database | MySQL 8 – users, orders, order items |
| Document database | MongoDB + Mongoose – products and reviews |
| Authentication | express-session, bcryptjs |
| Validation | express-validator |
| Security | helmet, express-mongo-sanitize, express-rate-limit |

## Architecture

MVC pattern with a middleware chain: **routes → middleware (auth, validation) → controllers → models → EJS views**.

**Dual-database design:** MySQL stores data that needs relational integrity and transactions (users, orders, order items). MongoDB stores flexible, searchable product documents and reviews.

## Security measures

- **SQL injection:** parameterised (prepared) statements for all MySQL queries
- **NoSQL injection:** `express-mongo-sanitize` strips `$`-prefixed keys from request bodies
- **Password storage:** bcrypt hashing, never plaintext
- **Sessions:** `httpOnly` and `sameSite=lax` cookies, `secure` in production, session regeneration on login and register (prevents session fixation)
- **Access control:** role-based middleware (`requireAuth`, `requireAdmin`) protecting cart, checkout, profile and all `/admin` routes
- **Input validation and sanitisation:** express-validator rules for every form
- **HTTP headers:** helmet with a Content-Security-Policy
- **Brute-force / abuse protection:** global rate limit plus a stricter limit on login and registration
- **Request size limits** on JSON and form bodies
- **Secrets** are loaded from environment variables; `.env` is git-ignored

## Getting started

**Requirements:** Node.js 18+, MySQL 8+, MongoDB 6+ running locally.

```bash
git clone https://github.com/Banuchichak/iron-vault-shop.git
cd iron-vault-shop
npm install
cp .env.example .env        # then edit .env with your own values
npm run setup-db            # creates MySQL tables and the admin user
npm run seed                # inserts 8 sample products into MongoDB
npm start                   # http://localhost:3000
```

In `.env`, set `SESSION_SECRET`, your MySQL credentials and `ADMIN_DEFAULT_PASSWORD`. The app will not start without a session secret.

## Project structure

```
server.js            app bootstrap, security middleware, DB connections
config/              MySQL pool and MongoDB connection
models/              User.js, Order.js (MySQL) and Product.js (Mongoose)
controllers/         auth, shop, admin and user logic
middleware/          authentication guards and validation rules
routes/index.js      all route definitions
views/               19 EJS templates (shop, admin, auth, user)
public/              CSS and client-side JS
scripts/             setupDB.js and seed.js
```

## Known limitations and future work

- Sessions use Express's default in-memory store; a persistent store (for example Redis or MySQL) is needed for production
- No CSRF tokens yet (currently relies on `sameSite=lax`)
- No automated tests
- Checkout does not integrate a payment provider

## Author

**Banuchichak Mammadova** – Computer Engineering student, Baku Higher Oil School
