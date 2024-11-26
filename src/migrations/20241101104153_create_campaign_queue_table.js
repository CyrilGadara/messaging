/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("campaign_queue", function (table) {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
        table.enum("status", ["queued", "processing", "completed", "failed"]).defaultTo("queued");
        table.timestamp("queued_at").defaultTo(knex.fn.now());
        table.timestamp("started_at");
        table.timestamp("completed_at");
        table.integer("processed_count").defaultTo(0);
        table.json("error_logs");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        // Index for efficient queue processing
        table.index(["status", "queued_at"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("campaign_queue");
};
