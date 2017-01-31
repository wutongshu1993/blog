/*var express = require('express');
var router = express.Router();

/!* GET home page. *!/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;*/
//路由部分
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var multer = require('multer');
var storage = multer.diskStorage({
  filename : function (req, file, cb) {
    var type = file.originalname.slice(file.originalname.lastIndexOf('.'));
    var newName = Date.now()+type;
    console.log(newName);
      cb(null, newName);
  },
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
})
var upload = multer({
 /* dest : 'uploads/',*/
   /* rename: function (fieldname, filename) {
        return filename;
    }*/
   storage : storage
})
module.exports = function (app) {
  app.get('/', function (req, res) {
    console.log("user"+req.session.user);
    Post.getAll(null, function (err, posts) {
      if(err){
        posts = [];
      }
      res.render('index',{
        title : '主页',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        posts : posts
      });
    })

  });
  //检查状态，登录了就返回主页
  app.get('/reg', checkNotLogin);
  app.get('/reg',function (req, res) {
    res.render('reg',{
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),//flash之后再次获取就没有了，只能获取一次
      error: req.flash('error').toString()});

  });
  //检查状态，登录了就返回主页
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
      var name = req.body.name,
          password = req.body.password,
          password_re = req.body['password_repeat'],
          email = req.body.email;
    //检查两次密码是否一致
    if(password != password_re){
      req.flash('error', '两次密码不一致');
      return res.redirect('/reg');//返回注册页
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name : name,
      password : password,
      email : email
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
      if(err){
        req.flash('error', err);
        console.log("error1");
        return res.redirect('/');
      }
      console.log(user);
      if(user){
        req.flash('error','用户名已存在！');
        console.log("用户名已存在");
        return res.redirect('/reg');
      }
      //如果不存在，则新增用户
      newUser.save(function (err, user) {
        if(err){
          req.flash('error', err);
          console.log("error2");
          return res.redirect('/reg');//注册失败返回注册页
        }
        console.log("注册返回的user"+user);
        req.session.user = user;//用户信息存入session
        req.flash('success', '注册成功！');
        console.log("注册成功");
        return res.redirect('/');//注册成功返回主页
      });
    });
  });
  //检查状态，登录了就返回主页
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login', {title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  });
  //检查状态，登录了就返回主页
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    //生成密码的md5值
    console.log('密码'+req.body.password);
    var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }
      //检查密码是否一致
      if(user.password != password){
        req.flash('error','密码错误');
        return res.redirect('/login');
      }
      //用户名和密码都匹配，将用户信息写入session
      req.session.user = user;
      req.flash('success', '登陆成功');
      res.redirect('/');
    })
  });
  //检查状态，未登录了就返回登录页面
  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {title : '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  //检查状态，未登录了就返回登录页面
  //发表文章
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
      var curUser = req.session.user,
          post = new Post(curUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功');
      res.redirect('/');
    });
  });
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
  });
  //上传文件模块
    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload',{
          title : '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
    app.post('/upload', checkLogin);
    app.post('/upload', upload.single('file1'), function (req, res) {
        req.flash('success', '文件上传成功');
        res.redirect('/upload');
    })
    //获取用户文章页面
    app.get('/u/:name', function (req, res) {
        //检查用户是否存在
        User.get(req.params.name, function (err, user) {
           if(!user){
             req.flash('error', '用户名不存在');
             return res.redirect('/');
           }
           //查询并返回用户的所有文章
            Post.getAll(user.name, function (err, posts) {
                if(err){
                  req.flash('error', err);
                  return res.redirect('/');
                };
                res.render('user', {
                  title : user.name,
                    posts : posts,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });
    //文章页面的路由规则
    app.get('/u/:name/:day/:title', function (req, res) {
      console.log(req.params);
        Post.getOne(req.params.name, req.params.day,req.params.title, function (err, post) {
            if(err){
              req.flash('error', err);
              return res.redirect('/');
            }
            res.render('article', {
                title : req.params.name,
                post : post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });




  //状态检查，已登录的不能访问登录和注册页面，直接跳到主页
  function checkLogin(req, res, next) {
    if(!req.session.user){
      req.flash('error', '未登录');
      res.redirect('/login');
    }
    next();
  }
//状态检查，已登录的不能访问登录和注册页面，直接跳到主页
  function checkNotLogin(req, res, next) {
    if(req.session.user){
      req.flash('error','已登录');
      res.redirect('back');
    }
    next();
  }
};
