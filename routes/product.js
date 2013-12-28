//CopyRight Tag Solutions pvt.ltd 2013
var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , path = require('path');


exports.home = function (req, res) {
    propertyModel.find({}, function (err, docs) {
        if (err) return res.render('Error occurred');
        res.render('index', {products: JSON.stringify(docs), routePath: "home"});
    });
};