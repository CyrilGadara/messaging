exports.up = function (knex) {
    return knex.schema.alterTable("messages", function (table) {
        table.dropColumn("file_upload_id");
        table.uuid("campaign_id").references("id").inTable("job_campaigns").onDelete("CASCADE");
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("messages", function (table) {
        table.dropColumn("campaign_id");
        table.uuid("file_upload_id").references("id").inTable("file_uploads").onDelete("CASCADE");
    });
};
