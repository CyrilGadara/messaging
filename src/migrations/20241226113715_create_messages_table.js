/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("messages", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("NEWID()"));
        table.uuid("user_id").notNullable();
        table.uuid("contact_id").notNullable();
        table.uuid("campaign_id").notNullable();
        table.string("type", 255).notNullable();
        table.string("template_name", 255).notNullable();
        table.text("content").notNullable();
        table.string("status", 255).defaultTo("pending");
        table.string("external_id", 255);

        // Using knex.fn.now() here
        table.timestamp("sent_at").defaultTo(knex.fn.now());
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        // Foreign Key References
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
        table.foreign("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
        table.foreign("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("messages");
};
