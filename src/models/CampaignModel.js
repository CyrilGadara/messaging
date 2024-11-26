const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const CampaignModel = {
    create: async (campaignData) => {
        let db;
        try {
            db = await getConnection();

            const campaign = {
                id: uuidv4(),
                user_id: campaignData.userId,
                job_role: campaignData.jobRole,
                location: campaignData.location,
                job_type: campaignData.jobType,
                company_name: campaignData.companyName,
                status: "ready",
                total_records: campaignData.totalValid,
                Processed_records: 0,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("job_campaigns").insert(campaign);

            return campaign;
        } catch (error) {
            logger.error("Error in CampaignModel.create: ", error);
            throw new Error("Failed to create campaign");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findById: async (id) => {
        let db;
        try {
            db = await getConnection();
            const campaign = await db("job_campaigns").where({ id }).first();
            return campaign;
        } catch (error) {
            logger.error("Error in CampaignModel.findById: ", error);
            throw new Error("Failed to fetch campaign");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    getStats: async (id) => {
        let db;
        try {
            db = await getConnection();
            const campaign = await db("job_campaigns").where({ id }).first();

            const messageCounts = await db("contacts")
                .where({ campaign_id: id })
                .select(
                    db.raw(`
                        COUNT(CASE WHEN whatsapp_status = 'sent' THEN 1 END) as whatsapp_sent,
                        COUNT(CASE WHEN whatsapp_status = 'not_sent' THEN 1 END) as whatsapp_pending,
                        COUNT(CASE WHEN whatsapp_status = 'failed' THEN 1 END) as whatsapp_failed,
                        
                        COUNT(CASE WHEN email_status = 'sent' THEN 1 END) as email_sent,
                        COUNT(CASE WHEN email_status = 'not_sent' THEN 1 END) as email_pending,
                        COUNT(CASE WHEN email_status = 'failed' THEN 1 END) as email_failed,
                        
                        COUNT(CASE WHEN sms_status = 'sent' THEN 1 END) as sms_sent,
                        COUNT(CASE WHEN sms_status = 'not_sent' THEN 1 END) as sms_pending,
                        COUNT(CASE WHEN sms_status = 'failed' THEN 1 END) as sms_failed
                    `)
                )
                .first();

            return {
                ...campaign,
                messageCounts,
            };
        } catch (error) {
            logger.error("Error in CampaignModel.getStats: ", error);
            throw new Error("Failed to get campaign stats");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    findByUserId: async (userId) => {
        let db;
        try {
            db = await getConnection();

            const campaigns = await db("job_campaigns")
                .where({ user_id: userId })
                .select("job_campaigns.*", db.raw("COUNT(contacts.id) as total_records"))
                .leftJoin("contacts", "job_campaigns.id", "contacts.campaign_id")
                .groupBy("job_campaigns.id")
                .orderBy("job_campaigns.created_at", "desc");

            return campaigns;
        } catch (error) {
            logger.error("Error in CampaignModel.findByUserId: ", error);
            throw new Error("Failed to fetch campaigns");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    updateStatus: async (id, status) => {
        let db;
        try {
            db = await getConnection();
            await db("job_campaigns").where({ id }).update({
                status: status,
                updated_at: db.fn.now(),
            });
            return true;
        } catch (error) {
            logger.error("Error in CampaignModel.updateStatus: ", error);
            throw new Error("Failed to update campaign status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    updateProcessedCount: async (id, processedCount) => {
        let db;
        try {
            db = await getConnection();
            await db("job_campaigns").where({ id }).update({
                Processed_records: processedCount,
                updated_at: db.fn.now(),
            });
        } catch (error) {
            logger.error("Error in CampaignModel.updateProcessedCount: ", error);
            throw new Error("Failed to update processed count");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    incrementProcessedCount: async (id) => {
        let db;
        try {
            db = await getConnection();
            await db("job_campaigns").where({ id }).increment("Processed_records", 1).update({ updated_at: db.fn.now() });
        } catch (error) {
            logger.error("Error in CampaignModel.incrementProcessedCount: ", error);
            throw new Error("Failed to increment processed count");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    getProcessedCount: async (id) => {
        let db;
        try {
            db = await getConnection();
            const campaign = await db("job_campaigns").where({ id }).first();
            return campaign ? campaign.Processed_records : 0;
        } catch (error) {
            logger.error("Error in CampaignModel.getProcessedCount: ", error);
            throw new Error("Failed to get processed count");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(CampaignModel);

module.exports = CampaignModel;
