const express = require('express');
const router = express.Router();

const {
  logout,
  isUserLoggedIn,
  loginUser,
  checkgroup,
  checkPermit,
} = require('../controllers/authController');

router.route('/login').post(loginUser);
router.route('/logout').get(isUserLoggedIn, logout);
router.route('/checkgroup').post(isUserLoggedIn, checkgroup);
router.route('/checkpermit/:appacronym').post(isUserLoggedIn, checkPermit);

module.exports = router;
