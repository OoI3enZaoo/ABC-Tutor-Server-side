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
	 var path = firstPath + '/' + req.params.contentid;
	if (!fs.existsSync(path)){
		fs.mkdir(path);
	}
	console.log(path);
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

// get all branch
app.get('/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
		if(err) throw err;
		var query = "SELECT * FROM `branch`"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	});
});

app.get('/getcourse/:branchid/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var branch_id = req.params.branchid
	  var query = "SELECT c.course_id, c.user_id, c.branch_id, c.subject, c.code, c.price, c.des as des, c.cover as cover, c.ts, c.lastUpdate, u.fname,u.lname,u.user_img,u.facebook,u.twitter,u.youtube from course c, user u WHERE u.user_id = c.user_id AND branch_id = "+branch_id+" ORDER BY c.ts DESC"
	  ;
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});

//get all course in any branch
app.get('/courselength/:branchid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
		var branch_id = req.params.branchid
		var query = "SELECT COUNT(*) as count FROM `course` WHERE branch_id = "+branch_id+" "
	  connection.query(query , function(err, rows) {
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
		;
		connection.query(query, function(err, rows) {
			//res.json(rows)
		res.status(200).send();

		connection.release();
	  });
	});
});
app.post('/upload/:contentid',  upload.any(), function(req, res) {

    res.status(200).send();
	var contentid = req.params.contentid //รับ content id
  mysqlPool.getConnection(function(err, connection) {
    if(err) throw err;
	for (i = 0; i < req.files.length; i++ ){
		var originalname = req.files[i].originalname //รับชื่อไฟล์
		var path = contentid + '/' + originalname //สร้าง path ไอดีผู้ใช้/ชื่อไฟล์
		var query = "INSERT INTO `course_content_file`(`content_id`,`content_name`, `content_file`) VALUES ("+contentid+",'"+originalname+"','"+path+"')"
		//var query = "INSERT INTO course_content_file VALUES("+contentid+",'"+path+"')"

			connection.query(query)
	}
  })
});

app.get('/course/:id/',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var id = req.params.id
	  var query = "SELECT * FROM `course` WHERE course_id = "+id+""
	  ;
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

		connection.query(query, function(){
			connection.release();
		})
	});
});

app.post('/insertcoursecontent', function(req,res){
	mysqlPool.getConnection(function(error,connection) {
		var content_id = req.body.content_id
		var course_id = req.body.course_id
		var content_title = req.body.content_title
		var content_des =  req.body.content_des
		var content_ts = req.body.content_ts
		var query = "INSERT INTO course_content VALUES("+content_id+","+course_id+",'"+content_title+"','"+content_des+"','"+content_ts+"')"

		connection.query(query)
	});
});
app.get('/getfile/:contentid/:filename' , function(req,res){
	var content_id = req.params.contentid
	var filename = req.params.filename
	var pathFile = __dirname + "/uploads/"+content_id+"/"+filename+""
	res.sendFile(pathFile)
});

app.get('/popularcourse/:branch' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var branch = req.params.branch
	  var query = "SELECT * from (SELECT course_id, COUNT(course_id) as count FROM user_purchase WHERE branch_id = "+branch+" GROUP BY course_id ORDER BY count DESC limit 5) up, course c, user u WHERE up.course_id = c.course_id and c.user_id = u.user_id"
	  ;
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});

app.get('/popularcourse' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var query = "SELECT * from course c , (SELECT course_id, count(course_id) as count from user_purchase GROUP BY course_id ORDER BY count desc limit 4) up,user u WHERE up.course_id = c.course_id and c.user_id = u.user_id"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})



app.post('/insertuserpurchase/' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var branch_id = req.body.branch_id;
	  var user_id = req.body.user_id
	  var purchase_ts = req.body.purchase_ts
		var query = "INSERT INTO `user_purchase`(`course_id`, `branch_id`, `user_id`, `purchase_ts`) VALUES ("+course_id+","+branch_id+","+user_id+",'"+purchase_ts+"')"
	  connection.query(query);
	})
})

app.get('/userpurchased/:course_id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.course_id
	  var query = "SELECT u.user_id, u.user_img,up.course_id,u.fname,u.lname, DATE_FORMAT(up.purchase_ts, '%Y-%m-%d %H:%i:%s') AS purchase_ts FROM user u,user_purchase up  WHERE up.user_id = u.user_id AND course_id = "+course_id+" GROUP BY up.purchase_id ORDER BY purchase_ts desc"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});

app.get('/user/:user_id',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.user_id
		var query = "SELECT * FROM `user` WHERE user_id = "+user_id+""
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
});

app.post('/insertreview' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var user_id = req.body.user_id
	  var review_text = req.body.review_text;
	  var review_ts = req.body.review_ts
	  var review_vote = req.body.review_vote
		var query = "INSERT INTO `course_review`(`course_id`, `user_id`, `review_text`, `review_ts`, `review_vote`) VALUES ("+course_id+","+user_id+",'"+review_text+"','"+review_ts+"',"+review_vote+")"

	  connection.query(query);
	})
})


// Avergane Course Voting
app.get('/get_avg_voting_by_courseid/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT course_id ,count(case when review_vote = 5 then 5 end) as five , count(case when review_vote = 4 then 1 end) as four, count(case when review_vote = 3 then 1 end) as three, count(case when review_vote = 2 then 1 end) as two,count(case when review_vote = 1 then 1 end) as one, AVG(review_vote) as avg, count(*) as length from course_review WHERE course_id = "+course_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// course_review using course_id order by ts DESC
app.get('/get_review_course_order_ts/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT cr.review_id , cr.course_id, cr.user_id, ur.fname , ur.lname ,cr.review_text ,DATE_FORMAT(cr.review_ts, '%Y-%m-%d %H:%i:%s') AS review_ts , `review_vote` , ur.user_img FROM course_review cr , user ur WHERE cr.course_id = "+course_id+" AND cr.user_id = ur.user_id ORDER BY review_ts DESC"
	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// course_review using user_id group by course_id
app.get('/get_review_course_user/:userid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var user_id = req.params.userid;
	  var query = "SELECT course_id FROM `course_review` WHERE `user_id` = "+user_id+" GROUP BY course_id"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// post chat
app.post('/insertchat' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.body.course_id;
	  var user_id = req.body.user_id
	  var chat_text = req.body.chat_text;
	  var chat_ts = req.body.chat_ts
		var query = "INSERT INTO `course_chat`(`course_id`, `user_id`, `chat_text`, `chat_ts`) VALUES ("+course_id+","+user_id+",'"+chat_text+"','"+chat_ts+"')"

	  connection.query(query);
	})
})

// get course_chat order by course_id
app.get('/get_course_chat/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT `chat_id`, `course_id`, `user_id`, `chat_text`, DATE_FORMAT(`chat_ts`, '%Y-%m-%d %H:%i:%s') AS chat_ts FROM `course_chat` WHERE `course_id` = "+course_id+" ORDER BY chat_ts ASC"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// get course_content using course_id order by ts
app.get('/get_course_content/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT `content_id`, `course_id`, `content_title`, `content_des`, DATE_FORMAT(`content_ts`, '%Y-%m-%d %H:%i:%s') AS content_ts FROM `course_content` WHERE `course_id` = "+course_id+" ORDER BY content_ts ASC"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// get course_content_file using content_id
app.get('/get_course_content_file/:contentid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var content_id = req.params.contentid;
	  var query = "SELECT * FROM `course_content_file` WHERE `content_id` = "+content_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// get course_announce using course_id order by ts
app.get('/get_course_announce/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT `annou_id`, `course_id`, `annou_text`, DATE_FORMAT(`annou_ts`, '%Y-%m-%d %H:%i:%s') AS annou_ts FROM `course_announce` WHERE `course_id` = "+course_id+" ORDER BY annou_ts DESC"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// get course_announce_comment using annou_id
app.get('/get_course_announce_comment/:annouid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var annou_id = req.params.annouid;
	  var query = "SELECT `annou_com_id`, `annou_id`, `user_id`, `annou_com_text`, DATE_FORMAT(`annou_com_ts`, '%Y-%m-%d %H:%i:%s') AS annou_com_ts FROM `course_announce_comment` WHERE `annou_id` = "+annou_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// post course_announce
app.post('/insertcourse_announce' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var annou_id = req.body.annou_id;
	  var course_id = req.body.course_id;
	  var annou_text = req.body.annou_text
	  var annou_ts = req.body.annou_ts;
		var query = "INSERT INTO `course_announce`(`annou_id`,`course_id`, `annou_text`, `annou_ts`) VALUES ("+annou_id+","+course_id+",'"+annou_text+"','"+annou_ts+"')"

	  connection.query(query);
	})
})

// post course_announce_comment
app.post('/insertcourse_announce_comment' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var annou_id = req.body.annou_id;
    var user_id = req.body.user_id
	  var annou_com_text = req.body.annou_com_text
	  var annou_com_ts = req.body.annou_com_ts;
		var query = "INSERT INTO `course_announce_comment`(`annou_id`, `user_id`, `annou_com_text`, `annou_com_ts`) VALUES ("+annou_id+","+user_id+",'"+annou_com_text+"','"+annou_com_ts+"')"

	  connection.query(query);
	})
})

// get course_q using course_id order by ts
app.get('/get_course_q/:courseid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var course_id = req.params.courseid;
	  var query = "SELECT `q_id`, `course_id`, `user_id`, `q_text`, DATE_FORMAT(`q_ts`, '%Y-%m-%d %H:%i:%s') AS q_ts FROM `course_q` WHERE `course_id` = "+course_id+" ORDER BY q_ts DESC"

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// get course_q_comment using q_id
app.get('/get_course_q_comment/:qid',function(req,res) {
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var q_id = req.params.qid;
	  var query = "SELECT `q_com_id`, `q_id`, `user_id`, `q_com_text`, DATE_FORMAT(`q_com_ts`, '%Y-%m-%d %H:%i:%s') AS q_com_ts FROM `course_q_comment` WHERE `q_id` = "+q_id+""

	  connection.query(query, function(err, rows) {
		res.json(rows);
		connection.release();
	  });
	})
})

// post course_q
app.post('/insertcourse_q' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
    var q_id = req.body.q_id;
	  var course_id = req.body.course_id;
    var user_id = req.body.user_id
	  var q_text = req.body.q_text
	  var q_ts = req.body.q_ts;
		var query = "INSERT INTO `course_q`(`q_id`,`course_id`, `user_id`, `q_text`, `q_ts`) VALUES ("+q_id+","+course_id+","+user_id+",'"+q_text+"','"+q_ts+"')"

	  connection.query(query);
	})
})

// post course_q_comment
app.post('/insertcourse_q_comment' , function(req,res){
	mysqlPool.getConnection(function(err, connection) {
	  if(err) throw err;
	  var q_id = req.body.q_id;
    var user_id = req.body.user_id
	  var q_com_text = req.body.q_text
	  var q_com_ts = req.body.q_ts;
		var query = "INSERT INTO `course_q_comment`(`q_id`, `user_id`, `q_com_text`, `q_com_ts`) VALUES ("+q_id+","+user_id+",'"+q_com_text+"','"+q_com_ts+"')"

	  connection.query(query);
	})
})

module.exports = app;
