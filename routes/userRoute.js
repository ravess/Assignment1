const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/userController");

// User Login Routes
router.route("/").get(getAllUsers);

module.exports = router;
