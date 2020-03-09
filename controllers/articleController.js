const Article = require('../models/article');
const Author = require('../models/author');
const Genre = require('../models/genre');

const async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的房间列表
exports.article_list = (req, res) => { 
    Article.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_articles) {
      if (err) { return next(err); }
      res.render('article_list', { title: '房间列表', article_list: list_articles });
    });
};

// 为每位房间显示详细信息的页面
exports.article_detail = (req, res) => { 
    Article.findById(req.params.id)
      .populate('author').populate('genre')
      .exec(
        (err,article)=>{
          if (err) { return next(err); }
          if (article==null) { // No results.
            let err = new Error('没有找到这个房间');
            err.status = 404;
            return next(err);
          }
          res.render('article_detail', { title: '房名', article: article } );
        }
      );
};
 
// 由 GET 显示创建房间的表单
exports.article_create_get = (req, res, next) => {  
  Genre.find().exec((err,genres)=>{
    if (err) { return next(err); }
    res.render('article_form',{title:'创建房间', genres:genres})
  })
};

// 由 POST 处理房间创建操作
exports.article_create_post = [
  //种类数组化
  (req, res, next) => {
    if(!(req.body.genre instanceof Array)){
      if(typeof req.body.genre==='undefined')
      req.body.genre=[];
      else
      req.body.genre=new Array(req.body.genre);
    }
    next(); 
  },
  body('title', '房名必须不为空。').isLength({ min: 1 }).trim(),
  body('password', '用户口令必须不为空').isLength({ min: 1 }).trim(),
  sanitizeBody('title').trim().escape(),
  sanitizeBody('content').trim().escape(),
  sanitizeBody('summary').trim().escape(),
  sanitizeBody('password').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    Author.findOne({'name':req.body.name,'password':req.body.password})
    .exec((err,author)=>{
      if(err){return next(err)};
      if (author==null) { // 找不到这个用户
        //如果不这么做，那么如果用户输入错误，内容将直接被清空，但这么做就会涉及双重三目表达式，我不知道能不能对
        res.render('article_form', { title: '创建房间', a_title:req.body.title, a_summary: req.body.summary, a_content: req.body.content, input_err:'密码错误或没有这个用户' });
        return;
      }
      author_h=author._id;
      let article = new Article(
        { 
          title: req.body.title,
          author: author_h,
          content: req.body.content,
          summary: req.body.summary,
          genre: req.body.genre
        }
        );
        if (!errors.isEmpty()) {
          Genre.find().exec((err,genres)=>{
            if (err) { return next(err); }
            // 已经标记好的类型被选择
            for (let i = 0; i < genres.length; i++) {
              if (article.genre.indexOf(genres[i]._id) > -1) {
                results.genres[i].checked='true';
              }
            }          //这里可能要出Bug,双重三目表达式
            res.render('article_form', { title: '创建房间', genres:genres, article: article, errors: errors.array() });
            return;
          })
        }
        else {
          // Data from form is valid. Save article.
          article.save(function (err) {
            console.log('bad news');
          if (err) { return next(err); }
          //successful - redirect to new article record.
          res.redirect(article.url);
        });
      }
    })
  }
]

// 由 GET 显示删除房间的表单
exports.article_delete_get = (req, res) => { 
  Article.findById(req.params.id).populate('author').populate('genre')
    .exec((err,article)=>{
      if(err){return next(err);}//有错就报错
      if(article==null){res.redirect('/catalog/articles');}//这个类型没找到就重定向回去列表
      res.render('article_delete',{ title:'删除房间', article: article });
      //把找到的 这个副本实例、标题，丢进模版
    })
};

// 由 POST 处理房间删除操作
exports.article_delete_post =(req, res, next) => {
  async.parallel({
    article: function(callback) {
      Article.findById(req.body.articleid).populate('author').populate('genre').exec(callback)
    },
    guanliyuan: (callback) =>{
      Author.find({'identity': '管理员'}).exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err); }
    let c=true;
    if(!(results.guanliyuan instanceof Array)){
      if(typeof results.guanliyuan==='undefined')
      results.guanliyuan=[];
      else
      results.guanliyuan=new Array(results.guanliyuan);
    }
    for(let i=0;i<results.guanliyuan.length;i++){ 
      if (req.body.password==results.guanliyuan[i].password)c=false;
    }
    if(req.body.password != results.article.author.password
      && c == true) {
      res.render('article_delete', { title: '删除房间', article: results.article, input_err: "口令错误" } );
      return;
    }
    else {
      Article.findByIdAndRemove(req.body.articleid, err => {
        if (err) { return next(err); }
        res.redirect('/catalog/articles')
      })
    }
  });
};




// 由 GET 显示更新房间的表单
exports.article_update_get = (req, res) => { 
  Article.findById(req.params.id).exec((err, article)=>{
    if(err){ return next(err); }
    if(article==null){
      let err= new Error("房间没找到");
      err.status=404;
      return next(err);
    }
    res.render('end_form',{title:'更改信息前确认身份',fine:false});
  });
};

// 由 POST 处理房间更新操作
exports.article_update_post = (req, res, next) => {
  if(req.body.title==undefined){ //验证身份成功之前
    async.parallel(
      {
        article:(callback)=>{ //取房间用户
          Article.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        guanliyuan:(callback)=>{  //取管理员
          Author.find({'identity':'管理员'}).exec(callback);
        },
        genres:(callback)=>{
          Genre.find().exec(callback)
        }
      },(err,results)=>{
        if (err) { return next(err); }
        let c=true;
        //管理员数组化
        if(!(results.guanliyuan instanceof Array)){
          if(typeof results.guanliyuan==='undefined')
          results.guanliyuan=[];
          else
          results.guanliyuan=new Array(results.guanliyuan);
        }
        //验证是否是管理员口令
        for(let i=0;i<results.guanliyuan.length;i++){
          if (req.body.v_password==results.guanliyuan[i].password)c=false;
        }
        //密码错误
        if(req.body.v_password != results.article.author.password
          && c == true) {
          res.render('end_form', { title: '更改信息前确认身份', fine: false, input_err: "口令错误" } );
          return;
        }//密码正确
        else {
          for (let i = 0; i < results.genres.length; i++) {
            if (results.article.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked='true';
            }
          }//标记该房间类型
          res.render('end_form',{title:'更改房间信息', fine: true, article: results.article, genres: results.genres});
        }
      }
    );
  }else{//已经确认身份，正式开始更改
    Article.findById(req.params.id).populate('author').populate('genre').exec((err,results)=>{
      //种类数组化
      if(!(req.body.genre instanceof Array)){
        if(typeof req.body.genre==='undefined')
        req.body.genre=[];
        else
        req.body.genre=new Array(req.body.genre);
      };
      body('title', '标题必须不为空。').isLength({ min: 1 }).trim();
      sanitizeBody('title').trim().escape();
      const errors = validationResult(req);
      author_h=results.author._id;
      let article = new Article(
        { 
          title: req.body.title,
          author: author_h,
          content: req.body.content,
          summary: req.body.summary,
          genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
          _id: req.params.id
        }
      );
      if (!errors.isEmpty()) {
        Genre.find().exec((err,genres)=>{
          for (let i = 0; i < results.genres.length; i++) {
            if (results.article.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked='true';
            }
          }//标记该房间类型
          res.render('end_form', { title: '更改房间信息', fine:true, article: article, genres: genres, errors: errors.array() });
        })
        return;
      }
      else {
  
        Article.findByIdAndUpdate(req.params.id,article,{},(err,thearticle)=>{
          if (err) { return next(err); }
          //successful - redirect to new article record.
          res.redirect(article.url);
        });
  
      }
    })
  }
}


