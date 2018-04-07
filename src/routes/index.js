const Users = require('./users')
const Parking = require('./parking')

module.exports = function (server) {
    let users = new Users()
    let parking = new Parking()
    users.register(server)
    parking.register(server)
}