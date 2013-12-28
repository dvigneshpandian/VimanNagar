var User = require('../models/user');

exports.index= function(req,res,done){
    process.nextTick(function(){
        var query =  User.findOne({ 'lsrId': req.body.email });
        query.exec(function(err, oldUser){
            if (oldUser){
                console.log('Existing User:' + oldUser.name + ' found and logged in!');
                done(null, oldUser);
                res.send('/','Welcome: '+oldUser.name);
                res.send({redirect:'/loggedin'});
            }else{
                //var newUser = new User();
                //newUser.lsrId = req.body.email;
                //newUser.lsrPassword = req.body.password;
                //newUser.save(function(err){
                //    if(err) throw err;
                //  console.log('New user: ' + newUser.first_name + ' created and logged in!');
                res.send('/login','User not found please Sign up');
                //  done(null, newUser);
                //});
            }
        });
    });
};

exports.signup= function(req, res){
    res.render('signup.jade')
};

exports.login= function(req, res){
    res.render('login.jade')
};

exports.loggedin=function(req, res,done){
    process.nextTick(function(){
        var query = User.findOne({ 'email': req.body.email });
        query.exec(function (err, oldUser) {
            res.send({redirect:'/loggedin'});
        })
    });
};

exports.signedup=function(req,res,done){
    process.nextTick(function(){
        var query = User.findOne({ 'lsrId': req.body.email });
        query.exec(function (err, oldUser) {
            console.log(oldUser);
            if(oldUser) {
                console.log('User: ' + oldUser.name + ' found and logged in!');
                done(null, oldUser);
                console.log ("profile", req.body);
            } else {
                var newUser = new User();
                newUser.email = req.body.email;
                newUser.name = req.body.firstName+' '+req.body.lastName;
                newUser.appPassword = req.body.password;
                newUser.save(function(err){
                    if(err) throw err;
                    console.log(err);
                    console.log('New user: ' + newUser.name + ' created and logged in!');
                    res.send('allworked ');
                    done(null, newUser);
                    res.send({redirect:'/loggedin'});
                });
            }
        });
    });
};
