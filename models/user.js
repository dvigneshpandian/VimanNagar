/**
 * Created with IntelliJ IDEA.
 * User: user
 * Date: 9/12/13
 * Time: 12:38 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.development.dbUrl);

/*exports.findById = function(id, callback) {
    console.log('Trying to find user with id: ' + id);
    db.collection('users').findOne({'_defined
        at Object.<anonymouid':new BSON.ObjectID(id)}, function(err, user) {
        console.log('Trying to find user with id: ' + id);
        callback(err, user);
    });
};*/

var userSchema = new mongoose.Schema({
    twitterId: String,
    linkedinId: String,
    fbId: String,
    name: String,
    username: String,
    first_name: String,
    last_name: String,
    email: {type: String, lowercase: true},
    gender: String,
    bio: String,
    birthday: String,
    friends: Object,
    hometown: Object,
    location: Object,
    appPassword: String,
    favorite_teams: Object
});

module.exports = mongoose.model('user', userSchema);


