const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const ApplicationModel = {
    create: async (applicationData) => {
        let db;
        try {
            db = await getConnection();

            const application = {
                id: uuidv4(),
                campaign_id: applicationData.campaignId,
                contact_id: applicationData.contactId,
                job_status: applicationData.jobStatus,
                expected_salary: applicationData.expectedSalary,
                notice_period: applicationData.noticePeriod,
                additional_details: applicationData.additionalDetails,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("applications").insert(application);

            return application;
        } catch (error) {
            logger.error("Error in ApplicationModel.create: ", error);
            throw new Error("Failed to create application");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findById: async (id) => {
        let db;
        try {
            db = await getConnection();
            const application = await db("applications").where({ id }).first();
            return application;
        } catch (error) {
            logger.error("Error in ApplicationModel.findById: ", error);
            throw new Error("Failed to fetch application");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findByCampaignId: async (campaignId) => {
        let db;
        try {
            db = await getConnection();
            // const applications = await db("applications")
            //     .where({
            //         campaign_id: campaignId,
            //     })
            //     .orderBy("created_at", "desc");

            const applications = await db("applications")
                .join("contacts", "applications.contact_id", "contacts.id")
                .select("applications.*", "contacts.id", "contacts.name", "contacts.email", "contacts.phone_number")
                .where("applications.campaign_id", campaignId)
                .orderBy("applications.created_at", "desc");

            return applications;
        } catch (error) {
            logger.error("Error in ApplicationModel.findByCampaignId: ", error);
            throw new Error("Failed to fetch applications");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findByCampaignIdAndContactId: async (campaignId, contactId) => {
        let db;
        try {
            db = await getConnection();
            const application = await db("applications").where({ campaign_id: campaignId, contact_id: contactId }).first();
            return application;
        } catch (error) {
            logger.error("Error in ApplicationModel.findByCampaignIdAndContactId: ", error);
            throw new Error("Failed to fetch application");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(ApplicationModel);

module.exports = ApplicationModel;
