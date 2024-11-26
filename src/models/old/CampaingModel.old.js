const { getConnection, releaseConnection } = require("../config/db");
const { email } = require("../config/emailConfig");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const CampaignModel = {
    create: async (capmaingData) => {
        let db;
        try {
            db = await getConnection();
            const id = uuidv4();
            const campaing = {
                id,
                user_id: capmaingData.user_id,
                job_role: capmaingData.job_role,
                location: capmaingData.location,
                job_type: capmaingData.job_type,
                company_name: capmaingData.company_name,
                status: "processing",
                total_recipients: 0,
                processed_count: 0,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("job_campaigns").insert(campaing);

            logger.info(`Campaign created successfully: ${id}`);
            return campaing;
        } catch (error) {
            logger.error("Error in CampaignModel.create: ", error);
            throw new Error("Failed to create campaign");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    findById: async (id) => {
        let db;
        try {
            db = await getConnection();
            const campaing = await db("job_campaings").where({ id }).first();
            return campaing;
        } catch (error) {
            logger.error("Error in CampaignModel.findById: ", error);
            throw new Error("Failed to find campaign");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    findByUserId: async (userId) => {
        let db;
        try {
            db = await getConnection();
            const campaings = await db("job_campaings").where({ user_id: userId });
            return campaings;
        } catch (error) {
            logger.error("Error in CampaignModel.findByUserId: ", error);
            throw new Error("Failed to find campaigns");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    updateStatus: async (id, status, stats = {}) => {
        let db;
        try {
            db = await getConnection();
            const updateData = {
                status,
                updated_at: db.fn.now(),
            };

            if (stats.totalRecipients) updateData.total_recipients = stats.totalRecipients;
            if (stats.processedCount) updateData.processed_count = stats.processedCount;

            await db("job_campaings").where({ id }).update(updateData);
            return true;
        } catch (error) {
            logger.error("Error in CampaignModel.updateStatus: ", error);
            throw new Error("Failed to update campaign status");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    getStats: async (id) => {
        let db;
        try {
            db = await getConnection();

            const campaing = await db("job_campaings")
                .where({ id })
                .select("status", "total_recipients", "processed_count", "created_at", "updated_at")
                .first();

            const messageCounts = await db("messages").where({ campaing_id: id }).select("status").count("* as count").groupBy("status");

            return {
                ...campaing,
                messageCounts: messageCounts.reduce((acc, curr) => {
                    acc[curr.status] = curr.count;
                    return acc;
                }, {}),
            };
        } catch (error) {
            logger.error("Error in CampaignModel.getStats: ", error);
            throw new Error("Failed to get campaign stats");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    delete: async (id) => {
        let db;
        try {
            db = await getConnection();
            await db("job_campaings").where({ id }).del();
            logger.info(`Campaign ${id} deleted successfully`);
            return true;
        } catch (error) {
            logger.error("Error in CampaignModel.delete: ", error);
            throw new Error("Failed to delete campaign");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
    // createContacts: async (contacts, campaingId) => {
    //     let db;
    //     try {
    //         db = await getConnection();
    //         const contactsWithIds = contacts.map((contact) => ({
    //             id: uuidv4(),
    //             job_campaign_id: campaingId,
    //             name: contact.name,
    //             email: contact.email,
    //             phone_number: contact.phone_number,
    //             created_at: db.fn.now(),
    //             updated_at: db.fn.now(),
    //         }));

    //         await db("contacts").insert(contactsWithIds);
    //         logger.info(`Created ${contacts.length} contacts for campaign: ${campaingId}`);
    //         return contactsWithIds;
    //     } catch (error) {
    //         logger.error("Error in CampaignModel.createContacts: ", error);
    //         throw new Error("Failed to create contacts");
    //     } finally {
    //         if (db) {
    //             await releaseConnection(db);
    //             logger.info("Database connection released");
    //         }
    //     }
    // },
};

Object.freeze(CampaignModel);

module.exports = CampaignModel;
