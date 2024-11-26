const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const CampaignQueueModel = {
    create: async (campaignId) => {
        let db;
        try {
            db = await getConnection();
            const queueEntry = {
                id: uuidv4(),
                campaign_id: campaignId,
                status: "queued",
                queued_at: db.fn.now(),
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("campaign_queue").insert(queueEntry);
            logger.info(`CampaignQueueModel: created campaign queue entry for campaign ${campaignId}`);
            return queueEntry;
        } catch (error) {
            logger.error(`CampaignQueueModel: error creating campaign queue entry for campaign ${campaignId}`);
            logger.error(error);
            throw error;
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
    getNextQueued: async () => {
        let db;
        try {
            db = await getConnection();
            const nextInQueue = await db("campaign_queue")
                .whereIn("status", ["queued", "processing"]) // Checking for both statuses
                .orderBy("queued_at", "asc")
                .first();

            return nextInQueue;
        } catch (error) {
            logger.error("Error in CampaignQueueModel.getNextQueued: ", error);
            throw new Error("Failed to get next queued campaign");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
    updateStatus: async (id, status) => {
        let db;
        try {
            db = await getConnection();

            const updateData = {
                status,
                updated_at: db.fn.now(),
            };

            await db("campaign_queue").where({ id }).update({
                status,
                updated_at: db.fn.now(),
            });

            // Seet appropriate timestamps based on status
            if (status === "processing") {
                updateData.started_at = db.fn.now();
            } else if (status === "completed" || status === "failed") {
                updateData.completed_at = db.fn.now();
            }

            await db("campaign_queue").where({ id }).update(updateData);
        } catch (error) {
            logger.error("Error in CampaignQueueModel.updateStatus: ", error);
            throw new Error("Failed to update campaign queue status");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
};

Object.freeze(CampaignQueueModel);

module.exports = CampaignQueueModel;
