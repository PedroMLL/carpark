const { Model } = require('objection')
const Knex = require('knex')
const knex = Knex(require('../knexfile'))
const throng = require('throng')
const restify = require('restify')
const package = require('../package.json')
const epimetheus = require('epimetheus')
const routes = require('./routes')
const errors = require('restify-errors')
Model.knex(knex)
const port = process.env.PORT || 3000
const jwt = require('restify-jwt-community')
const publicCert = require('fs').readFileSync('./keys/public.pem')
function main() {
    const server = restify.createServer({
        name: package.name,
        version: package.version
    });

    epimetheus.instrument(server)
    server.use(restify.plugins.acceptParser(server.acceptable))
    server.use(restify.plugins.bodyParser({ mapParams: false }))

    if (process.env.NODE_ENV == "production") {
        server.use(restify.plugins.gzipResponse());
    }
    server.on('restifyError', function (req, res, err, next) {
        if (err.errors) {
            res.json({
                code: err.statusText,
                message: err.message,
                error: err.errors
            })
            res.status(err.status);
            return
        }
        next(err)

    });
    server.use(
        jwt({ secret: publicCert })
            .unless({ path: ['/users/login','/metrics'] })
    )
    routes(server)
    server.listen(port, () => console.log(`Listening on ${port}`))

}
throng(main)