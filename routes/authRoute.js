const express = require('express');
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
  checkGroup,
} = require('../controllers/authController');
const { getAllUsers } = require('../controllers/adminController');

router.route('/login').post(loginUser);
router.route('/logout').get(isUserLoggedIn, logout);

module.exports = router;
