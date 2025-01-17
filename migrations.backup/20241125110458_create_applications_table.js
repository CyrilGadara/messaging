/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("applications", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
        table.uuid("contact_id").references("id").inTable("contacts").onDelete("CASCADE");
        table.string("job_status").notNullable();
        table.string("expected_salary");
        table.string("notice_period");
        table.string("additional_details");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("applications");
};
