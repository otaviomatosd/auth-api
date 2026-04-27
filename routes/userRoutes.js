const express = require("express");
const authMiddleware = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();


router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);


router.get("/profile", authMiddleware, authController.getProfile);
router.get("/", authMiddleware, authController.getAllUsers);
router.get("/:id", authMiddleware, authController.getUserById);
router.put("/:id", authMiddleware, authController.updateUser);
router.post("/logout", authMiddleware, authController.logout);
router.delete("/:id", authMiddleware, authController.deleteUser);

module.exports = router;