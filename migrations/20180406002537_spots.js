
const Spots = require('../src/models/spots')
const concat = (x, y) =>
    x.concat(y)

const flatMap = (f, xs) =>
    xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function (f) {
    return flatMap(f, this)
}
exports.up = async function (knex, Promise) {
    const { Model } = require('objection')
    try {
        Model.knex(knex)
        let exists = await knex.schema.hasTable('spots')
        if (!exists) {
            await knex.schema.createTable('spots', table => {
                table.increments('id').primary()
                table.integer('number').notNullable()
                table.integer('floor').notNullable()
                table.boolean('usable').defaultTo(true)
                table.unique(['floor', 'number'])
            });
        }
        spots = [...Array(3).keys()].flatMap(
            floor => [...Array(10).keys()].map(
                number => {
                    return {
                        floor: floor + 1,
                        number: number + 1
                    }
                }
            )
        )
        await Spots.query().insert(spots)
    } catch (e) {
        console.log(e)
    }
};

exports.down = function (knex, Promise) {

};
