exports.up = async function (knex, Promise) {
    try {
        let exists = await knex.schema.hasTable('spots_occupations')
        if (!exists) {
            await knex.schema.createTable('spots_occupations', table => {
                table.increments('id').primary()
                table.integer('spotId').notNullable()
                table.integer('userId').notNullable().references('users.id')
                table.unique('userId')
                table.unique('spotId')
                table.foreign('spotId').references('spots.id')
            });
        }
    } catch (e) {
        console.log(e)
    }
};

exports.down = function (knex, Promise) {

};
