const express = require("express");
const { body } = require("express-validator");
const UserController = require("../controllers/UserController");
const { redirectIfAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Pages
router.get("/", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});

//create-user route
router.post(
    "/create-user",
    [
        body("username")
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3, max: 30 })
            .withMessage("Username must be between 3 and 30 characters")
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage("Username can only contain letters, numbers, and underscores"),
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
            .withMessage("Password must include one lowercase letter, one uppercase letter, one number, and one special character"),
        body("role").notEmpty().withMessage("User role is required").isIn(["admin", "user"]).withMessage("Role must be either 'admin' or 'user'"),
    ],
    UserController.register
);

// Login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    UserController.login
);

// Logout
router.get("/logout", UserController.logout);

module.exports = router;
