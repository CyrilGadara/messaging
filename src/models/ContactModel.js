const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const BATCH_SIZE = 100;

const ContactModel = {
    batchCreate: async (contacts, campaignId) => {
        let db;
        try {
            db = await getConnection();

            const results = [];

            for (i = 0; i < contacts.length; i += BATCH_SIZE) {
                const batch = contacts.slice(i, i + BATCH_SIZE).map((contact) => ({
                    id: uuidv4(),
                    campaign_id: campaignId,
                    name: contact.name,
                    email: contact.email,
                    phone_number: contact.phone,
                    whatsapp_status: "not_sent",
                    created_at: db.fn.now(),
                    updated_at: db.fn.now(),
                }));

                await db("contacts").insert(batch);
                results.push(...batch);
            }

            logger.info(`Created ${results.length} contacts`);
            return results;
        } catch (error) {
            logger.error("Error in ContactModel.batchCreate: ", error);
            throw new Error("Failed to create contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findByCampaignId: async (campaignId) => {
        let db;
        try {
            db = await getConnection();
            const contacts = await db("contacts").where({ campaign_id: campaignId }).orderBy("created_at", "desc");
            return contacts;
        } catch (error) {
            logger.error("Error in ContactModel.findByCampaignId: ", error);
            throw new Error("Failed to fetch contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findById: async (id) => {
        let db;
        try {
            db = await getConnection();
            const contact = await db("contacts").where({ id }).first();
            return contact;
        } catch (error) {
            logger.error("Error in ContactModel.findById: ", error);
            throw new Error("Failed to fetch contact");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findPendingContactsByCampaignId: async (campaignId) => {
        let db;
        try {
            db = await getConnection();
            const contacts = await db("contacts")
                .where({
                    campaign_id: campaignId,
                    whatsapp_status: "not_sent",
                })
                .orderBy("created_at", "desc");
            return contacts;
        } catch (error) {
            logger.error("Error in ContactModel.findByCampaignId: ", error);
            throw new Error("Failed to fetch contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    updateWhatsAppStatus: async (id, status) => {
        let db;
        try {
            db = await getConnection();
            await db("contacts").where({ id }).update({
                whatsapp_status: status,
                updated_at: db.fn.now(),
            });
        } catch (error) {
            logger.error("Error in ContactModel.updateWhatsAppStatus: ", error);
            throw new Error("Failed to update whatsapp status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    updateSMSStatus: async (id, status) => {
        let db;
        try {
            db = await getConnection();
            await db("contacts").where({ id }).update({
                sms_status: status,
                updated_at: db.fn.now(),
            });
        } catch (error) {
            logger.error("Error in ContactModel.updateSMSStatus: ", error);
            throw new Error("Failed to update sms status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    updateEmailStatus: async (id, status) => {
        let db;
        try {
            db = await getConnection();
            await db("contacts").where({ id }).update({
                email_status: status,
                updated_at: db.fn.now(),
            });
        } catch (error) {
            logger.error("Error in ContactModel.updateEmailStatus: ", error);
            throw new Error("Failed to update email status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findByPhoneNumber: async (phoneNumber) => {
        let db;
        try {
            db = await getConnection();
            const contact = await db("contacts").where({ phone_number: phoneNumber }).orderBy("created_at", "desc").first();
            return contact;
        } catch (error) {
            logger.error("Error in ContactModel.findByPhoneNumber: ", error);
            throw new Error("Failed to find contact");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(ContactModel);

module.exports = ContactModel;
