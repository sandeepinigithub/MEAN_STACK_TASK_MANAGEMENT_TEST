const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

// POST /api/auth/register
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login);

// GET /api/auth/profile  (protected)
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;
