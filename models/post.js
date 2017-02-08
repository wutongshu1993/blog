/**
 * Created by lh on 2017/1/18.
 */
var mongodb = require('./db');
//使用markdown
var markdown = require('markdown').markdown;
function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
    var date = new Date();
    //存储各种时间格式，方便以后的扩展
    var time = {
        date : date,
        year : date.getFullYear(),
        month : date.getFullYear()+'-'+date.getMonth() + 1,
        day : date.getFullYear()+'-'+date.getMonth() + 1+'-'+date.getDay(),
        minute: date.getFullYear()+'-'+date.getMonth() + 1+'-'+date.getDay()+' '+date.getHours()+':'+
        (date.getMinutes() < 10 ? 0 + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        time : time,
        title : this.title,
        post : this.post,
        comments : []
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if(err){
            return callback(err);
        }
        //读取post集合
        db.collection('posts', function (err, collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post, {
                sate : true
            }, function (err ) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
//读取文章及其相关信息
Post.getAll = function(name, callback){
    //打开数据库
    mongodb.open(function (err, db) {
        if(err){
            return callback(err);
        }
        //读取post集合
        db.collection('posts', function (err, collection) {
            if(err){
                mongodb.close();
                return callback(collection);
            }
            var query = {};
            if(name){
                query.name = name;
            }
           //根据query对象查询文章
            collection.find(query).sort({
                time: -1//？？
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err){
                    return callback(err);
                }
                console.log(docs);
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                })
                callback(null, docs);//成功，以数组形式返回查询的结果
            });
        });
    });
};
//获取一篇文章
Post.getOne = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if(err){
           return callback(err);
        }
        //读取post集合
        db.collection('posts', function (err, collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期和标题来查找
            collection.findOne({//属性为什么会加引号呢？？
                'name' : name,
                'time.day' : day,
                'title' : title
            }, function (err, doc) {
               mongodb.close();
               if (err){
                   return callback(err);
               };
               //解析markdown为html
                //添加评论的功能,将评论也显示为html的方式
                if(doc){
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);//每个comment都有一个字段叫做content
                    })
                }

               callback(null, doc);//返回查询的一篇文章
            })
        })
    })
}
//以markdown格式返回原始发送的内容
Post.edit = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if(err){
            return callback(err);
        }
        //读取post集合
        db.collection('posts', function (err, collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名，日期和标题查找
            collection.findOne({
                'name': name,
                'time.day' : day,
                'title': title
            }, function (err, doc) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                // doc.post = markdown.toHTML(doc.post);
                callback(null, doc);
            })
        })
    });
};
//更新博客内容
Post.update = function (name, day, title,post, callback) {
    mongodb.open(function (err, db) {
        if(err){
            return callback(db);
        }
        db.collection("posts", function (err, collection) {
            if(err){
                mongodb.close();
                callback(err);
            }
            collection.update({
                'name':name,
                'time.day':day,
                'title':title
            },{
                $set:{
                    'post':post
                }
            },function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
//删除某篇文章
Post.delete = function (name, day, title, callback) {
    mongodb.open(function (err, db) {
        if(err){
           return callback(err);
        }
        db.collection("posts",function (err, collection ) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                'name':name,
                'time.day':day,
                'title': title
            },{
                w:1
            }, function (err) {
                mongodb.close();
                if(err){
                   return  callback(err);
                }
               callback(null);
            });
        });
    });
}