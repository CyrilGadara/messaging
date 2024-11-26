const express = require("express");
const { body } = require("express-validator");
const ApplicationController = require("../controllers/applicationController");

const router = express.Router();

const validateApplication = [
    body("jobStatus").notEmpty().withMessage("Job status is required").isIn(["Employed", "Unemployed"]).withMessage("Invalid job status"),
    body("expectedSalary")
        .notEmpty()
        .withMessage("Expected salary is required")
        .isNumeric()
        .withMessage("Expected salary must be a number")
        .custom((value) => value > 0)
        .withMessage("Expected salary must be greater than 0"),
    body("noticePeriod")
        .notEmpty()
        .withMessage("Notice period is required")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Notice period must not exceed 100 characters"),
    body("additionalDetails")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Additional details must be a valid text")
        .trim()
        .isLength({ max: 500 })
        .withMessage("Additional details must not exceed 500 characters"),
];

router.get("/:campaignid/:contactid", ApplicationController.getCandidateDetails);

router.get("/thank-you", (req, res) => {
    res.render("application/thank-you");
});

router.get("/:campaignid/:contactid/apply", ApplicationController.checkIfApplicationExists);

router.post("/:campaignid/:contactid/submit", validateApplication, ApplicationController.submitApplication);

module.exports = router;
