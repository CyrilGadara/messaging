const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const CampaignController = require("../controllers/CampaignController");
const ResponseController = require("../controllers/ResponseController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router(); // Create a new router

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Campaign validation rules
const validateCampaign = [
    body("jobRole")
        .notEmpty()
        .withMessage("Job role is required")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Job role must not exceed 100 characters"),

    body("companyName")
        .notEmpty()
        .withMessage("Company name is required")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Company name must not exceed 100 characters"),

    body("location")
        .notEmpty()
        .withMessage("Location is required")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Location must not exceed 100 characters"),

    body("jobType")
        .notEmpty()
        .withMessage("Job type is required")
        .isIn(["Full-time", "Part-time", "Contract", "Freelance"])
        .withMessage("Invalid job type"),
];

// ================================================= //
// =============== CAMPAIGN PAGES ================== //
// ================================================= //
// campaigns page
router.get("/", requireAuth, CampaignController.getAllCampaigns);

// Create a new campaign
router.get("/create-campaign", requireAuth, (req, res) => {
    res.render("campaign/create", { user: req.user });
});

// Overview page
router.get("/:id/overview", requireAuth, CampaignController.getOverview);

// Contact page
router.get("/:id/contacts", requireAuth, CampaignController.getContacts);

// Applications page
router.get("/:id/applications", requireAuth, CampaignController.getApplications);

// ================================================= //
// =============== CAMPAIGN APIs ================== //
// ================================================= //

// Create a new campaign
router.post("/create", requireAuth, upload.single("file"), validateCampaign, CampaignController.create);

// Get campaign stats
router.get("/api/:id/stats", requireAuth, CampaignController.getCampaignStats);

router.post("/api/:id/start", requireAuth, CampaignController.startCampaign);

// Webhook route
router.post("/webhook", ResponseController.create);

module.exports = router;
