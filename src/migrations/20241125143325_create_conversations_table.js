/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("conversations", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
        table.text("message");
        table.string("external_id");
        table.enum("message_type", ["sent", "received"]).defaultTo("sent");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("conversations");
};
