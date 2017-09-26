var Express = require('express')
var mysql = require('mysql')
var multer  = require('multer')
var fs = require('fs');
var app = new Express()
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	 var firstPath = 'uploads'
	 if (!fs.existsSync(firstPath)){
		fs.mkdir(firstPath);
	}
	 var path = firstPath + '/' + req.params.num;
	if (!fs.existsSync(path)){
		fs.mkdir(path);
	}

	cb(null, path)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({storage: storage});
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
		res.json(rows);
		connection.release();
	  });
	});
});

app.get('/getcourse/:id/:lfrom/:lto',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  var lfrom = req.params.lfrom
	  var lto = req.params.lto
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des, c.cover, c.ts FROM course c WHERE branch_id = "+id+" ORDER BY c.ts DESC limit "+lfrom+","+lto+""
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	});
});
app.get('/courselength/:id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  connection.query('SELECT COUNT(*) as count FROM `course` WHERE branch_id = ' + id, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	});
});
app.post('/upload/:userid/:contentid',  upload.any(), function(req, res) {
	res.status(204).end();
  var userid = req.params.userid;
  var path = userid + '/' req.file
  var contentid = req.params.contentid
  mysqlPool.getConnection(function(err, connection) {
    if(err) throw err;
    var query = "INSERT INTO content_content_file VALUES("+contentid+","+path+")"
    connection.query(query, function(err,rows){
      connection.release();
    })
  })

});


module.exports = app;
