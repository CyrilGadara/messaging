/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("contacts", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("NEWID()"));
        table.uuid("campaign_id").notNullable();
        table.string("name", 255).notNullable();
        table.string("email", 255).notNullable();
        table.string("phone_number", 255).notNullable();
        table.string("whatsapp_status", 255).defaultTo("not_sent");
        table.string("sms_status", 255).defaultTo("not_sent");
        table.string("email_status", 255).defaultTo("not_sent");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        table.foreign("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("contacts");
};
