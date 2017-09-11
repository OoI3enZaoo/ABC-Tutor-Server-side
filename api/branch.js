var Express = require('express')
var app = new Express()
var mongojs = require('mongojs');

// var db = mongojs('mongodb://ben:ben@ds133044.mlab.com:33044/tutordb', ['branch']);

var db = mongojs('mongodb://localhost:27017/Tutor', ['branchs']);

console.log("test");
db.on('connect', function() {
    console.log('mongoDB connected')
});
db.on('error', function(err) {
    console.log('mongoDB error', err)
});


app.get('/',function(req,res){
  db.branchs.find(function (err, docs) {
      res.json(docs)
      console.log(docs)
  })


})


module.exports = app;
