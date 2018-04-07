const { Model } = require('objection');
class Occupation extends Model {
    static get tableName() {
        return 'spots_occupations';
    }
    static get relationMappings() {
        const User = require('./users')
        const Spots = require('./spots')
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'spots_occupations.userId',
                    to: 'users.id'
                }
            },
            spot: {
                relation: Model.BelongsToOneRelation,
                modelClass: Spots,
                join: {
                    from: 'spots_occupations.spotId',
                    to: 'spots.id'
                }
            }
        }
    }
}

module.exports = Occupation;