var Express = require('express')
var mysql = require('mysql')
var app = new Express()
var mysqlPool = mysql.createPool({
    host     : '172.104.167.197',
    user     : 'root',
    password : 'my-secret-pw',
    database : 'tutordb'
});
app.get('/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  connection.query('SELECT * FROM `branch`', function(err, rows) {
		res.send(rows);
		connection.release();
	  });
	});
});

app.get('/getcourse/:id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  connection.query('SELECT * FROM `course` WHERE branch_id = ' + id, function(err, rows) {
		res.send(rows);
		connection.release();
	  });
	});
});

module.exports = app;
