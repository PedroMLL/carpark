const { Model } = require('objection');
class SpotsHistory extends Model {
    static get tableName() {
        return 'spots_history';
    }
    static get relationMappings() {
        const User = require('./users')
        const Spots = require('./spots')
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'spots_history.userId',
                    to: 'users.id'
                }
            },
            spot: {
                relation: Model.BelongsToOneRelation,
                modelClass: Spots,
                join: {
                    from: 'spots_history.spotId',
                    to: 'spots.id'
                }
            }
        }
    }
}

module.exports = SpotsHistory;