const express = require("express");
const { body } = require("express-validator");
const UserController = require("../controllers/UserController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router(); // Create a new router

// Get all users
router.get("/", requireAdmin, UserController.getAllUsers);

// Create a new user
router.get("/create-user", requireAdmin, (req, res) => {
    res.render("users/create-user", { user: req.user });
});

// Get a specific user
router.get("/:id", requireAdmin, UserController.getUser);

// Update user
router.put(
    "/:id",
    [
        body("name")
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3, max: 30 })
            .withMessage("Username must be between 3 and 30 characters")
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage("Username can only contain letters, numbers, and underscores"),
        body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
        body("role").notEmpty().withMessage("User role is required").isIn(["admin", "user"]).withMessage("Role must be either 'admin' or 'user'"),
        body("status").notEmpty().withMessage("Account status is required").isIn(["active", "inactive"]),
        // Password validation, only if password is provided
        body("newPassword")
            .optional({ checkFalsy: true })
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
            .withMessage("Password must include one lowercase letter, one uppercase letter, one number, and one special character"),
    ],
    UserController.updateUser
);

// Delete user
router.delete("/:id", UserController.deleteUser);

module.exports = router;
