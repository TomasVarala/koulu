require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const albumRoutes = require('./routes/albums');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// Passport
require('./passport-config')(passport);
app.use(passport.initialize());

// Käytä sessioita vain jos EI olla testitilassa
if (process.env.NODE_ENV !== 'test') {
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    })
  }));
  app.use(passport.session());
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use(errorHandler);

// Yhdistä kantaan ja käynnistä serveri vain jos EI olla testissä
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

app.use(errorHandler);
module.exports = app;
