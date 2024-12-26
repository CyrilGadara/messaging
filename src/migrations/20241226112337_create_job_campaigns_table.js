/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("job_campaigns", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("NEWID()"));
        table.uuid("user_id").notNullable();
        table.string("job_role", 255).notNullable();
        table.string("location", 255).notNullable();
        table.string("job_type", 255).notNullable();
        table.string("company_name", 255).notNullable();
        table.integer("total_records").defaultTo(0);
        table.integer("processed_records").defaultTo(0);
        table.string("status", 255).defaultTo("pending");
        table.json("error_logs");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("job_campaigns");
};
