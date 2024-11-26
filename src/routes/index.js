const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const campaignRoutes = require("./campaignRoutes");
const applicationRoutes = require("./applicationRoutes");

const router = express.Router();

router.get("/", (req, res) => {
    res.redirect("/auth");
});

router.get("/error", (req, res) => {
    res.render("error-page", { error: { message: "Something went wrong" } });
    // res.send("error page");
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/apply", applicationRoutes);

module.exports = router;
