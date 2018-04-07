const { mixin, Model } = require('objection');
const Password = require('objection-password')();
const softDelete = require('objection-soft-delete')
class Users extends mixin(Model, [
    Password,
    softDelete({ columnName: 'deleted' })
]) {
    static get tableName() {
        return 'users';
    }
    static get relationMappings() {
        const Spots = require('./spots')
        return {
            spot: {
                relation: Model.BelongsToOneRelation,
                modelClass: Spots,
                join: {
                    from: 'users.id',
                    throught: {
                        from: 'spots_occupations.userId',
                        to: 'spots_occupations.spotId'
                    },
                    to: 'spots.id'
                }
            }
        }
    }
}

module.exports = Users;