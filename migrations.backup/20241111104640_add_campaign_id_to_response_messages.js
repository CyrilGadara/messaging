/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("message_responses", function (table) {
        table.uuid("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("message_responses", function (table) {
        table.dropColumn("campaign_id");
    });
};
