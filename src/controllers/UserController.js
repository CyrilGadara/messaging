const UserModel = require("../models/UserModel");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const whatsappServiceInstance = require("../services/whatsappService");

const JWT_SECRET = process.env.JWT_SECRET;

const UserController = {
    register: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const { username, email, password, role, companyName, companyLogo } = req.body;
            let errorArray = [];

            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                errorArray.push({
                    type: "field",
                    value: username,
                    msg: "Username is already taken",
                    path: "username",
                    location: "body",
                });
            }

            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) {
                errorArray.push({
                    type: "field",
                    value: email,
                    msg: "User with this email already exists",
                    path: "email",
                    location: "body",
                });
            }

            if (errorArray.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errorArray,
                });
            }
            const newUser = await UserModel.create({ username, email, password, role, company_logo: companyLogo, company_name: companyName });

            logger.info(`New user registred: ${newUser.id}`);

            res.status(201).json({
                success: true,
                message: "User registred successfully",
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        } catch (error) {
            logger.error("Error in UserController.register: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to register user",
            });
        }
    },
    login: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "validation failed",
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;
            let errorArray = [];

            const user = await UserModel.findByEmail(email);

            if (!user) {
                errorArray.push({
                    type: "field",
                    value: email,
                    msg: "User with this email does not exist",
                    path: "email",
                    location: "body",
                });
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                    errors: errorArray,
                });
            }

            if (!user.status) {
                return res.status(401).json({
                    success: false,
                    message: "Your account has been deactivated",
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }

            const token = jwt.sign(
                { userId: user.id, userName: user.username, email: user.email, role: user.role, companyLogo: user.company_logo },
                JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 3600000,
            });

            logger.info(`User logged in: ${user.id}`);

            res.status(200).json({
                success: true,
                message: "Login successful",
            });
        } catch (error) {
            logger.error("Error in UserController.login: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to login user",
            });
        }
    },

    verifyToken: async (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return next("NoToken");
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
    },
    logout: async (req, res) => {
        res.clearCookie("token");
        res.redirect("/");
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await UserModel.findAll();

            if (!users) {
                return res.status(404).json({
                    success: false,
                    message: "No users found",
                });
            }
            // res.render("users/manage-users", { user: req.user });
            res.render("users/manage-users", {
                users,
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in UserController.getAllUsers: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to get users",
            });
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            res.render("users/edit-user", {
                userData: user,
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in UserController.getUser: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to get user",
            });
        }
    },
    updateUser: async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }
            console.log("----------------------------------");
            console.log(req.body, null, 2);
            console.log("----------------------------------");
            // Get the user ID and form data
            const { name, email, role, status, newPassword, companyName, companyLogo } = req.body;
            const userId = req.params.id;

            // Prepare the data for updating
            let updateData = {
                username: name,
                email,
                role,
                status,
                company_name: companyName,
                company_logo: companyLogo,
            };

            updateData.status = status === "active" ? 1 : 0;

            // If a new password is provided, hash it
            if (newPassword) {
                const bcrypt = require("bcryptjs");
                updateData.password = await bcrypt.hash(newPassword, 10);
            }

            // Update the user in the database
            const updatedUser = await UserModel.updateUser(userId, updateData);

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Return success response
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            logger.error("Error in UserController.updateUser: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to update user",
            });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            await UserModel.deleteUser(req.params.id);
            res.status(200).json({
                success: true,
                message: "User deleted",
            });
        } catch (error) {
            logger.error("Error in UserController.deleteUser: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete user",
            });
        }
    },
};

module.exports = UserController;
