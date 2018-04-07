const { Users } = require('../src/models')

exports.up = async function (knex, Promise) {
    const { Model } = require('objection')
    try {
        Model.knex(knex)
        let exists = await knex.schema.hasTable('users')
        if (!exists) {
            await knex.schema.createTable('users', table => {
                table.increments('id').primary();
                table.string('email').unique().notNullable();
                table.string('username').unique().notNullable();
                table.string("password").notNullable();
                table.enum('role', ["USR", "ADM"]).notNullable();
                table.string('firstName').notNullable();
                table.string('lastName').notNullable();
                table.boolean('deleted').defaultTo(false);
                table.timestamp('created_at').defaultTo(knex.fn.now());

            });
        }
        await Users.query().insert({
            "username": "admin",
            "password": "admin",
            "email": "admin@localhost",
            "firstName": "Car",
            "lastName": "Park",
            "role": "ADM"
        })
    } catch (e) {
        console.log(e)
    }
};

exports.down = function (knex, Promise) {

};
