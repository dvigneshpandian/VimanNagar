
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var productRoutes = require('./routes/product');
var flash = require('connect-flash')

, TwitterStrategy = require('passport-twitter').Strategy
, LinkedInStrategy = require('passport-linkedin').Strategy;

var mongoose = require('mongoose')
    ,fs = require('fs');
var mongo = require('mongodb');

var app = express();
var config = require('./config');

var User = require('./models/user');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    LocalStrategy = require('passport-local').Strategy;

var TWITTER_CONSUMER_KEY = "tvgVZEPFVdFFfVH9o1UNKQ";
var TWITTER_CONSUMER_SECRET = "x4AG0kMnk0ojjAobkfXU0XPKuSaHloav6x3BA6n7gEM";

var LINKEDIN_API_KEY = "77qbt9a1nupzl0";
var LINKEDIN_SECRET_KEY = "4gzjVSejFsbNf2qU";

//set up the passport

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

//STRATEGY FOR NORMAL LOGIN
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'passwd'
    },
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

//strategy for facebook login
passport.use(new FacebookStrategy({
        clientID: config.development.fb.appId,
        clientSecret: config.development.fb.appSecret,
        callbackURL: config.development.fb.url+ '/' +'fbauthed',
        passReqToCallback: true
    },
    function(req,accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            var query =  User.findOne({ 'fbId': profile.id });
            query.exec(function(err, oldUser){
                if (oldUser){
                    console.log('Existing User:' + oldUser.name + ' found and logged in!');
                    done(null, oldUser);
                    /*console.log ("accesToken ", accessToken);
                     console.log ("refreshToken", refreshToken); */
                     console.log ("profile", profile);
                }else{
                    var newUser = new User();
                    newUser.fbId = profile.id;
                    if(profile.name !== 'undefined'){
                        newUser.name = profile.displayName;}
                    if(profile.username !== 'undefined'){
                        newUser.username = profile._json.username;}
                    if(profile.first_name !== 'undefined'){
                        newUser.first_name = profile._json.first_name;}
                    if(profile.last_name !== 'undefined'){
                        newUser.last_name = profile._json.last_name;}
                    if(profile.email !== 'undefined'){
                        newUser.email = profile.emails[0].value;}
                    if(profile.gender !== 'undefined'){
                        newUser.gender = profile.gender;}
                    if(profile.birthday !== 'undefined'){
                        newUser.birthday = profile._json.birthday;}
                    if(typeof profile.hometown !== 'undefined'){
                        newUser.hometown = profile._json.hometown.name;}
                    if(typeof profile.location !== 'undefined'){
                        newUser.location = profile._json.location.name; }
                    if(typeof profile.friends !== 'undefined')
                    newUser.friends = profile._json.friends;
                    newUser.save(function(err){
                        if(err) throw err;
                        console.log('New user: ' + newUser.name + ' created and logged in!');
                        done(null, newUser);
                    });
                }
            });
        });
    }
));

//strategy for twitter login
passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: "http://127.1.1.0:3000/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        process.nextTick(function () {
            var query = User.findOne({ 'twitterId': profile.id });
            query.exec(function (err, oldUser) {
                console.log(oldUser);
                if(oldUser) {
                    console.log('User: ' + oldUser.name + ' found and logged in!');
                    done(null, oldUser);
                    console.log ("profile", profile);
                } else {
                    var newUser = new User();
                    newUser.twitterId = profile.id;
                    if(profile.name !== 'undefined'){
                        newUser.name = profile.displayName;}
                    if(profile.username !== 'undefined'){
                        newUser.username = profile.username;}
                    if(profile.location !== 'undefined')
                    newUser.location = profile._json.location;
                    newUser.save(function(err) {
                        if(err) {throw err;}
                        console.log ("profile", profile);
                        console.log('New user: ' + newUser.name + ' created and logged in!');
                        done(null, newUser);
                    });
                }
            });
        });
    }
));


//strategy for linkedin login
passport.use(new LinkedInStrategy({
        consumerKey: LINKEDIN_API_KEY,
        consumerSecret: LINKEDIN_SECRET_KEY,
        profileFields: ['id', 'first-name', 'last-name', 'email-address','public-profile-url'],
        callbackURL: "http://127.1.1.0:3000/auth/linkedin/callback"
    },
    function(token, tokenSecret, profile, done) {
        process.nextTick(function () {
            var query = User.findOne({ 'linkedinId': profile.id });
            query.exec(function (err, oldUser) {
                console.log(oldUser);
                if(oldUser) {
                    console.log('User: ' + oldUser.name + ' found and logged in!');
                    done(null, oldUser);
                    console.log ("profile", profile);
                } else {
                    var newUser = new User();
                    if(profile.name !== 'undefined'){
                        newUser.name = profile.displayName;}
                    newUser.linkedinId = profile.id;
                    newUser.email = profile._json.emailAddress;
                    newUser.save(function(err) {
                        if(err) {throw err;}
                        console.log ("profile", profile);
                        console.log('New user: ' + newUser.name + ' created and logged in!');
                        done(null, newUser);
                    });
                }
            });
        });
    }
));


// all environments
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('sslport', process.env.SSLPORT || 3030);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({keepExtensions:true, uploadDir:path.join(__dirname,'public/images')}));
    app.use(express.methodOverride());
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.session({ secret: '09efbe9a8a1fb61432451259ddc5bf76'}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + "/public"));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//mongoose.connect('mongodb://localhost/LSR');
var options = {
    key: fs.readFileSync('domain.tld.key'),
    cert: fs.readFileSync('domain.tld.crt')
};


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Successfully mongodb is connected');
});


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', routes.index);
app.get('/signup', user.signup);
app.post('/signedup', user.signedup);
app.get('/login',user.login);
app.post('/loggedin',user.loggedin);


//facebook login
app.get('/', routes.index);
app.get('/fbauth', passport.authenticate('facebook', {/*display:'popup',*/ scope: ['email', 'user_birthday', 'user_hometown', 'user_friends','read_stream'] }));
app.get('/loggedin', ensureLoggedIn('/'), routes.index);
app.get('/fbauthed', passport.authenticate('facebook',{
    failureRedirect: '/',
    successRedirect: '/'
}));


//twitter login
app.get('/auth/twitter',
    passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });


//linkedin login
app.get('/auth/linkedin',
    passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });



app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/');
});

app.get('/settings', ensureAuthenticated,  function(req, res){
    res.render('settings')
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}