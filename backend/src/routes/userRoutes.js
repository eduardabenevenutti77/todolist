const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.post("/register", userController.register);
router.post("/login", userController.login);
// router.post("/logout", userController.logout);
router.post("/setupTwoFactor", userController.setupTwoFactor);
router.post("/disableTwoFactor", userController.disableTwoFactor);
router.get("/auth", authMiddleware, userController.auth);

module.exports = router;
