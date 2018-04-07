const Route = require('./route')
const validate = require('restify-api-validation')
const Joi = require('joi')
const UsersModel = require('../models/users')
const Occupations = require('../models/occupations')
const History = require('../models/spotsHistory')
const Spots = require('../models/spots')
const errors = require('restify-errors')
const { transaction } = require('objection')
/**
 * Parking API route to park and find the car
 */
class Parking extends Route {
    /**
     * Constructor
     */
    constructor() {
        super()
    }
    /**
     * Register routes within the server
     * @param {server} server restify server
     */
    register(server) {
        super.register(server)

        server.get('/spots', this.notSheldon)
        server.post('/spots',
            validate({
                options: { flatten: true },
                body: {
                    floor: Joi.number().integer().required(),
                    number: Joi.number().integer().required()
                }
            }),
            this.createSpots)
        server.get('/spots/sheldon', this.sheldon)
        server.get('/cars', this.sheldon)
        server.post('/cars',
            validate({
                options: { flatten: true },
                body: {
                    floor: Joi.number().integer().required(),
                    number: Joi.number().integer().required()
                }
            }),
            this.park.bind(this))

        server.del('/spots/:id',
            this.unpark)
    }
    
    /**
     * Find the spot (id) if it exists
     * @param {number} floor 
     * @param {number} number 
     */
    spot(floor, number) {
        return Spots
            .query()
            .first()
            .where('floor', floor)
            .andWhere('number', number)
            .andWhere('usable', true)

    }
    
    /**
     * Create spots in a floor
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async createSpots(req, res, next) {
        try {
            const ret = await transaction(Spots.knex(), async (trx) => {
                let spots = [...Array(req.body.number).keys()]
                    .map(
                        number => {
                            return {
                                floor: req.body.floor,
                                number: number + 1
                            }
                        }
                    )
                let ret = await Spots.query(trx).insert(spots)
                return ret
            });
            res.send(201, { inserted: ret.length() })
        } catch (e) {
            next(e)
        }
    }
    /**
     * Find free spots
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async notSheldon(req, res, next) {
        try {
            let spots = await Spots
                .query()
                .where('usable', true)
                .andWhere('id', 'not in', Occupations
                    .query()
                    .select('spotId')
                )
                .select('floor', 'number')
                .orderBy('floor', 'ASC')
                .orderBy('number', 'ASC')
            res.send(spots.map(spot => spot.toJSON()))
        } catch (e) {
            next(e)
        }
    }
    /**
     * Where is my spot
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async sheldon(req, res, next) {
        try {
            let spots = await UsersModel
                .query()
                .select('id')
                .eager('spot')
                .findById(req.user.id)

            res.send(spots)
        } catch (e) {
            next(e)
        }
    }
    /**
     * Unpark my parked car
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async unpark(req, res, next) {
        try {
            let spot =
                await Occupations
                    .query(trx)
                    .select('userId')
                    .findById(req.params.id)
            if (!spot || spot.userId != req.user.id) {
                return next(new errors.NotFoundError())
            }
            const spots = await transaction(Spots.knex(), async (trx) => {
                await Occupations
                    .query()
                    .deleteById(req.params.id)
                let history =
                    await History
                        .query(trx)
                        .insert({
                            userId: req.user.id,
                            spotId: req.params.id,
                            event_type: 'FREE'
                        })
            })
            res.send(204)
        } catch (e) {
            next(e)
        }
    }
    /**
     * Parked my car
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async park(req, res, next) {
        try {
            const spots = await transaction(Spots.knex(), async (trx) => {
                let s = await this.spot(req.body.floor, req.body.number)
                let spots =
                    await Occupations
                        .query(trx)
                        .insert({
                            userId: req.user.id,
                            spotId: s.id
                        })
                let history =
                    await History
                        .query(trx)
                        .insert({
                            userId: req.user.id,
                            spotId: s.id,
                            event_type: 'OCCUPIED'
                        })

            })
            res.send(201, { id: spots.id })
        } catch (e) {
            next(new errors.InvalidArgumentError("Cannot park here"))
        }
    }
}

module.exports = Parking