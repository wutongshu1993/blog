/**
 * Created by lh on 2017/1/16.
 */
var mongodb = require('./db');
function User(user){
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.mongodb = require('./db');
}
module.exports = User;

//存储用户信息
User.prototype.save = function (callback) {
    var user = {
        name: this.name,//此时this指向？
        password: this.password,
        email : this.email
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if(err){
            return callback(err);
        }
        //读取user集合
        db.collection('users', function (err, collection) {
            if(err){
                mongodb.close();
                console.log('打开数据库出错');
                return callback(err);
            }
            //将用户数据插入users集合
            collection.insert(user, {
                safe : true
            },function (err, user) {
                mongodb.close();
                if(err){
                    console.log('插入数据库出错');
                    return callback(err);
                }
                callback(null, user);//成功，err为null，并返回存储后的用户文档
            });
        });
    });
};

//读取用户信息
User.get = function (name, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if(err){
            mongodb.close();
            console.log('打开数据库出错'+err);
            return callback(err);
        }
        //查找用户名值为name 的一个文档
       db.collection('users', function (err, collection) {
           if(err){
               mongodb.close();
               return callback(err);
           }
           //读取collection集合
           collection.findOne({
               name : name
           }, function (err, user) {
               mongodb.close();
               if(err){
                   console.log('查找数据库出错'+err);
                   return callback(err);
               }
               callback(null, user);//成功，返回查询的用户信息
           })
       })

    })
}

