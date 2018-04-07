exports.up = async function (knex, Promise) {

    try {
        let exists = await knex.schema.hasTable('spots_history')
        if (!exists) {
            await knex.schema.createTable('spots_history', table => {
                table.increments('id').primary()
                table.integer('spotId').notNullable().references('spots.id')
                table.enum('event_type', ['FREE', 'OCCUPIED']).notNullable()
                table.integer('userId').notNullable().references('users.id')
                table.timestamp('event_time').defaultTo(knex.fn.now())

            });
        }
    } catch (e) {
        console.log(e)
    }
};

exports.down = function (knex, Promise) {

};
