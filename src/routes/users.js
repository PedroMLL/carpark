const Route = require('./route')
const validate = require('restify-api-validation')
const Joi = require('joi')
const UsersModel = require('../models/users')
const errors = require('restify-errors')
const jwt = require('jsonwebtoken')
const path = require('path')

let cert = require('fs').readFileSync(path.resolve('./keys/private.pem'))

class Users extends Route {
    constructor() {
        super()
    }

    /**
    * Register routes within the server
    * @param {server} server restify server
    */
    register(server) {
        super.register(server)

        server.post('/users/login', validate({
            options: { flatten: true },
            body: {
                username: Joi.string().required(),
                password: Joi.string().required()
            }
        }), this.login)

        server.post('/users',
            this.isAdmin,
            validate({
                options: { flatten: true },
                body: {
                    username: Joi.string().required(),
                    password: Joi.string().required(),
                    email: Joi.string().required().email(),
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    role: Joi.string().required().valid("ADM", "USR")
                }
            }),
            this.create)
        server.get('/users/:id', this.isSameUser, this.info)
        server.del('/users/:id', this.isAdmin, this.delete)
        server.put('/users/:id', this.isSameUser,
            validate({
                options: { flatten: true },
                body: {
                    password: Joi.string(),
                    email: Joi.string().email(),
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                }
            }),
            this.update)
    }
    /**
     * Get user info
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async info(req, res, next) {
        try {
            let user = await UsersModel
                .query()
                .first()
                .select('id',
                    'username',
                    'email',
                    'firstName',
                    'lastName',
                    'created_at',
                    'role')
                .where('id', req.params.id)
                .andWhere('deleted', false)

            if (!user) {
                return next(new errors.NotFoundError())
            }
            res.send(user)
        } catch (e) {
            next(e)
        }
    }
    
    /**
     * Delete an user
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async delete(req, res, next) {
        try {
            if (req.user.id == req.params.id) {
                return next(new errors
                    .InvalidArgumentError("Cannot delete yourself"))
            }
            let user = await UsersModel
                .query()
                .delete()
                .where('id', req.params.id)
                .returning('*')
            if (!user) {
                return next(new errors.NotFoundError())
            }
            res.send(204)
        } catch (e) {
            next(e)
        }
    }
    /**
     * Update an user
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async update(req, res, next) {
        try {
            let user = await UsersModel
                .query()
                .patch(req.body)
                .where('id', req.params.id)
                .andWhere('deleted', false)
                .returning('*')
            if (!user) {
                return next(new errors.NotFoundError())
            }
            res.send(204)
        } catch (e) {
            next(e)
        }
    }

    /**
     * Create an user
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async create(req, res, next) {
        try {
            let user = await UsersModel.query().insert(req.body)
            res.send(201, { id: user.id })
        } catch (e) {
            next(new errors.InvalidArgumentError(e.detail))
        }

    }

    /**
     * Login an user
     * @param {Request} req 
     * @param {Response} res 
     * @param {callback} next 
     */
    async login(req, res, next) {
        let invalidCredential = () => {
            next(new errors.InvalidCredentialsError())
        }
        try {
            const user = await UsersModel
                .query()
                .first()
                .where({ username: req.body.username })
                .andWhere('deleted', false)
            if (!user) {
                return invalidCredential()
            }
            const passwordValid = await user.verifyPassword(req.body.password);
            if (!passwordValid) {
                return invalidCredential()
            }
            let token = jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role,
                name: {
                    first: user.firstName,
                    last: user.lastName
                },
                email: user.email,
                creation_at: user.creation_at
            }, cert, {
                    algorithm: 'ES512',
                    expiresIn: '1h'
                })
            res.send({ token })
            next()
        } catch (e) {
            next(e)
        }

    }
}

module.exports = Users