const express = require("express");
const router = express.Router();

const { logout } = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/logout").post(logout);
