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
	 var path = firstPath + '/' + req.params.userid;
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

app.get('/getcourse/:id/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  var lfrom = req.params.lfrom
	  var lto = req.params.lto
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des, c.cover, c.ts, c.lastUpdate FROM course c WHERE branch_id = "+id+" ORDER BY c.ts DESC"
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
app.get('/user/:id', function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  connection.query('SELECT user_id,fname,lname,user_img,sex,birthday,email,facebook,twitter,youtube FROM `user` WHERE user_id = ' + id, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	});
});
app.post('/upload/:userid/:contentid',  upload.any(), function(req, res) {
  var contentid = req.params.contentid //รับ content id
  var userid = req.params.userid //รับไอดีผู้ใช้
  var originalname = req.files[0].originalname //รับชื่อไฟล์
  var path = userid + '/' + originalname //สร้าง path ไอดีผู้ใช้/ชื่อไฟล์
	var file_id = (new Date().getTime())
    res.status(200).send();
  mysqlPool.getConnection(function(err, connection) {
    if(err) throw err;
    var query = "INSERT INTO content_content_file VALUES("+file_id+",'"+contentid+"','"+path+"')"
    console.log(query)
    connection.query(query, function(err,rows){
      connection.release();
    })
  })
});


module.exports = app;
