const { Model } = require('objection');
class Spots extends Model {
    static get tableName() {
        return 'spots';
    }
}

module.exports = Spots;