// routes.js

const express = require('express');
const router = express.Router();

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  next();
};

router.get('/login', isLoggedIn, (req, res) => {
  // Render your login page
});

router.get('/register', isLoggedIn, (req, res) => {
  // Render your registration page
});

// Define other routes here

module.exports = router;
