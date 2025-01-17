const logger = require("../utils/logger");
const { validationResult } = require("express-validator");
const messagingService = require("../services/messagingService");
const CampaignModel = require("../models/CampaignModel");
const ContactModel = require("../models/ContactModel");
const CampaignQueueModel = require("../models/CampaignQueueModel");
const ApplicationModel = require("../models/ApplicationModel");

const CampaignController = {
    create: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Excel file is required",
                });
            }

            const fileResult = await messagingService.processExcelFile(req.file.buffer);

            if (fileResult.totalValid === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No valid contacts found in the excel file",
                    invalidRows: fileResult.invalidRows,
                });
            }

            const campaign = await CampaignModel.create({
                userId: req.user.userId,
                jobRole: req.body.jobRole,
                location: req.body.location,
                jobType: req.body.jobType,
                companyName: req.body.companyName,
                totalValid: fileResult.totalValid,
            });

            // Save contacts for this campaign
            await ContactModel.batchCreate(fileResult.contacts, campaign.id);

            res.status(200).json({ success: true, fileResult: fileResult });
        } catch (error) {
            logger.error("Error in CampaignController.create: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to create campaign",
            });
        }
    },

    getOverview: async (req, res) => {
        try {
            const campaign = await CampaignModel.findById(req.params.id);

            if (!campaign) {
                return res.status(404).render("error", {
                    message: "Campaign not found",
                });
            }

            if (campaign.user_id !== req.user.userId) {
                return res.status(403).render("error", {
                    message: "Unauthorized access",
                });
            }

            res.render("campaign/overview", { campaign, user: req.user });
        } catch (error) {
            logger.error("Error in CampaignController.getOverview: ", error);
            res.status(500).render("error", {
                message: "Failed to load campaign",
            });
        }
    },
    getCampaignStats: async (req, res) => {
        try {
            const stats = await CampaignModel.getStats(req.params.id);
            // console.log(stats, null, 2);
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found",
                });
            }

            res.json({
                success: true,
                stats: {
                    ...stats,
                    processed_count: stats.Processed_records,
                    total_recipients: stats.total_records,
                },
            });
        } catch (error) {
            logger.error("Error in CampaignController.getCampaignStats: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to get campaign stats",
            });
        }
    },

    getAllCampaigns: async (req, res) => {
        try {
            const campaigns = await CampaignModel.findByUserId(req.user.userId);

            res.render("campaign/campaigns", {
                campaigns,
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in CampaignController.getAllCampaigns: ", error);
            res.status(500).render("error", {
                message: "Failed to load campaigns",
            });
        }
    },

    getContacts: async (req, res) => {
        try {
            const campaign = await CampaignModel.findById(req.params.id);

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found",
                });
            }

            if (campaign.user_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            const contacts = await ContactModel.findByCampaignId(req.params.id);

            res.render("campaign/contacts", {
                campaign,
                contacts,
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in CampaignController.getContacts: ", error);
            res.status(500).render("error", {
                message: "Failed to load contacts",
            });
        }
    },

    getApplications: async (req, res) => {
        try {
            const campaign = await CampaignModel.findById(req.params.id);

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found",
                });
            }

            if (campaign.user_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            const applications = await ApplicationModel.findByCampaignId(req.params.id);

            res.render("campaign/applications", {
                campaign,
                applications,
                user: req.user,
            });
        } catch (error) {
            logger.error("Error in CampaignController.getApplications: ", error);
            res.status(500).render("error", {
                message: "Failed to load applications",
            });
        }
    },

    startCampaign: async (req, res) => {
        try {
            const campaign = await CampaignModel.findById(req.params.id);

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "campaign not found",
                });
            }

            if (campaign.user_id !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            if (campaign.status !== "ready") {
                return res.status(400).json({
                    success: false,
                    message: "Campaign is not ready",
                });
            }

            //Update campaign status to processing
            await CampaignModel.updateStatus(req.params.id, "processing");

            await CampaignQueueModel.create(campaign.id);

            res.json({
                success: true,
                message: "Campaign queued successfully",
            });
        } catch (error) {
            logger.error("Error in CampaignController.startCampaign: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to start campaign",
            });
        }
    },
};

Object.freeze(CampaignController);

module.exports = CampaignController;
