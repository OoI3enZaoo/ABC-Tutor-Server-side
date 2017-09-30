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
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname,u.lname,u.user_img,u.facebook,u.twitter,u.youtube from course c, user u WHERE u.user_id = c.user_id AND branch_id = "+id+" ORDER BY c.ts DESC"	
	  console.log(query);
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
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
app.post('/insertcourse', function (req,res) {	
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;	  
		var course_id = req.body.course_id
		var user_id = req.body.user_id
		var branch_id = req.body.branch_id
		var subject = req.body.subject
		var code = req.body.code
		var price = req.body.price
		var des = req.body.des
		var cover = req.body.cover
		var ts = req.body.ts
		var coupon = req.body.coupon
		var lastUpdate = req.body.lastUpdate
		var query = "INSERT INTO course VALUES("+course_id+","+user_id+","+branch_id+",'"+subject+"','"+code+"',"+price+",'"+des+"','"+cover+"','"+ts+"','"+coupon+"','"+lastUpdate+"')"
		console.log(query);
		connection.query(query, function(err, rows) {
			//res.json(rows)
		res.status(200).send();

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

app.get('/course/:id/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id	  
	  var query = "SELECT * FROM `course` WHERE course_id = "+id+""	
	  console.log(query);
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});

app.post('/updateuser', function(req,res){
	mysqlPool.getConnection(function(error,connection) {
		var user_id = req.body.user_id
		var fname = req.body.fname
		var lname = req.body.lname
		var user_img = req.body.user_img
		var email = req.body.email
		var facebook = req.body.facebook
		var youtube = req.body.youtube
		var twitter = req.body.twitter		
		var query = "UPDATE user set fname = '"+fname+"',lname ='"+lname+"',user_img ='"+user_img+"',email='"+email+"',facebook='"+facebook+"',twitter='"+twitter+"', youtube='"+youtube+"' WHERE user_id = "+user_id+""
		console.log(query)
		/*connection.query(query,function (err){
		})*/
	});
});
module.exports = app;
