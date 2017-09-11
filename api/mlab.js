var Express = require('express')
var app = new Express()
var mongojs = require('mongojs');

var db = mongojs('mongodb://ben:ben@ds133044.mlab.com:33044/tutordb', ['branch']);

console.log("test");
db.on('connect', function() {
    console.log('Mlab connected')
});
db.on('error', function(err) {
    console.log('Mlab error', err)
});


app.get('/',function(req,res){
  db.branch.find(function (err, docs) {
      res.json(docs)
      console.log(docs)
  })


})


module.exports = app;
