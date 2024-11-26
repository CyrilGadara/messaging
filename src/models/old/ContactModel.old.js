const { getConnection, releaseConnection } = require("../db/db");
const logger = require("../utils/logger");
const uuidv4 = require("uuid").v4;

const BATCH_SIZE = 100;

const ContactModel = {
    batchCreate: async (contacts, campaingId) => {
        let db;
        try {
            db = await getConnection();

            const results = [];

            for (i = 0; i < contacts.length; i += BATCH_SIZE) {
                const batch = contacts.slice(i, i + BATCH_SIZE).map((contact) => ({
                    id: uuidv4(),
                    campaing_id: campaingId,
                    name: contact.name,
                    email: contact.email,
                    phone_number: contact.phone_number,
                    whatsapp_status: "not_sent",
                    created_at: db.fn.now(),
                    updated_at: db.fn.now(),
                }));

                await db("contacts").insert(batch);
                results.push(...batch);
            }

            logger.info(`Created ${results.length} contacts for campaign: ${campaingId}`);
            return results;
        } catch (error) {
            logger.error("Error in ContactModel.batchCreate: ", error);
            throw new Error("Failed to create contacts");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    findByCampaing: async (campaingId, page = 1, limit = 50, filters = {}) => {
        let db;
        try {
            db = await getConnection();
            const query = db("contacts")
                .where({ campaing_id: campaingId })
                .select("contacts.*", db.raw("COALESCE(messages.status, 'not_sent') as message_status"))
                .leftJoin("messages", function () {
                    this.on("contacts.id", "=", "messages.contact_id").addOn(
                        db.raw("messages.created_at = (SELECT MAX(created_at) FROM messages WHERE contact_id = contacts.id)")
                    );
                });

            if (filters.status) {
                query.where("whatsapp_status", filters.status);
            }

            if (filters.search) {
                query.where(function () {
                    this.where("name", "link", `%${filters.search}%`)
                        .onWhere("email", "link", `%${filters.search}%`)
                        .onWhere("phone_number", "link", `%${filters.search}%`);
                });
            }

            const countQuery = query.clone().count("* as total").first();

            query
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy("created_at", "desc");

            const [contacts, countResult] = await Promise.all([query, countQuery]);

            return {
                contacts,
                total: countResult.total,
                page,
                totalPages: Math.ceil(countResult.total / limit),
            };
        } catch (error) {
            logger.error("Error in ContactModel.findByCampaing", error);
            throw new Error("Failed to fetch contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    updateStatus: async (contactId, status) => {
        let db;
        try {
            db = await getConnection();
            await db("contacts").where({ id: contactId }).update({ whatsapp_status: status, updated_at: db.fn.now() });

            logger.info(`Updated contact ${contactId} status to ${status}`);
            return true;
        } catch (error) {
            logger.error("Error in ContactModel.updateStatus", error);
            throw new Error("Failed to update contact status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    getPendingContacts: async (campaingId, batch = BATCH_SIZE) => {
        let db;
        try {
            db = await getConnection();
            const contacts = await db("contacts")
                .where({
                    campaing_id: campaingId,
                    whatsapp_status: "not_sent",
                })
                .limit(batch)
                .orderBy("created_at", "asc");

            return contacts;
        } catch (error) {
            logger.error("Error in ContactModel.getPendingContacts", error);
            throw new Error("Failed to get pending contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(ContactModel);

module.exports = ContactModel;
