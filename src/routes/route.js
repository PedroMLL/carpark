
const errors = require('restify-errors')

module.exports = class Route {
    constructor() {
    }

    register(server) { }
    isAdmin(req, res, next) {
        if (req.user.role != "ADM") {
            return next(new errors.UnauthorizedError())
        }
        return next()
    }
    isSameUser(req, res, next) {
        if (req.user.role == "ADM" || req.params.id == req.user.id) {
            return next()
        }
        next(errors.NotAuthorizedError())
    }
}