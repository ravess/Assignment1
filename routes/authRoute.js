const express = require("express");
const router = express.Router();

const { logout, isUserLoggedIn } = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").post(isUserLoggedIn, logout);
