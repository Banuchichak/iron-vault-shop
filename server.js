// server.js — Iron Vault Weapons Shop
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const { connectMySQL } = require('./config/mysql');
const { connectMongoDB } = require('./config/mongodb');
const { attachUser, flash } = require('./middleware/auth');
const routes = require('./routes/index');

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set in .env');
  process.exit(1);
}

const app = express();

// =================== SECURITY HEADERS ===================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
}));

// =================== RATE LIMITING ===================
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again in 15 minutes.',
});
app.use(globalLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// =================== TEMPLATE ENGINE ===================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================== MIDDLEWARE ===================
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// NoSQL injection prevention
app.use(mongoSanitize());

// =================== SESSIONS ===================
app.use(session({
  name: 'ironvault.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,                                    // XSS protection
    secure: process.env.NODE_ENV === 'production',     // HTTPS only in prod
    sameSite: 'lax',                                   // CSRF protection
    maxAge: 24 * 60 * 60 * 1000                       // 24 hours
  }
}));

// =================== CUSTOM MIDDLEWARE ===================
app.use(flash);
app.use(attachUser);

// =================== ROUTES ===================
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 — Iron Vault' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).render('error', {
    title: 'Error — Iron Vault',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
});

// =================== STARTUP ===================
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectMySQL();
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`\n🔫 Iron Vault running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
