const Room = require('../models/room');
const User = require('../models/user');
const Genre = require('../models/genre');
const Realyroom = require('../models/realyroom');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');

let h = '用户';
let H = 'user';

exports.user_list = function(req, res, next)  {
    User.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_users) {
      if (err) { return next(err); }
      res.render(H+'_list', { title: h+'列表', user_list: list_users });
    });
};//title、user_list
//user_list
 
exports.user_detail = function(req, res, next)  {
  async.parallel({
    user:  function(callback) {
        User.findById(req.params.id)
          .exec(callback)
    },
    user_realyrooms:  function(callback) {
      Realyroom.find({ 'user': req.params.id })
      .populate('room')
      .exec(callback)
    },
}, function(err, results)  {
    if (err) { return next(err); } 
    if (results.user==null) {
        let err = new Error('没有找到这个'+h);
        err.status = 404;
        return next(err);
    }
    res.render(H+'_detail', { title: h+'详情', user: results.user, user_realyrooms: results.user_realyrooms } );
});
};//title、user、user_realyrooms
//user_detail

exports.user_create_get = function(req, res, next)  {
  res.render('user_form', 
    { 
      title: '创建用户',
      create: true
    });
};//title
//user_form

exports.user_create_post = [
  body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明'),
  body('phonenumber').isLength({ min: 1 }).trim().withMessage('手机号码必须具体说明'),
  sanitizeBody('name').trim().escape(),
  sanitizeBody('phonenumber').trim().escape(),
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()){res.render(H+'_form', 
      { 
        title: '创建'+h, 
        user: req.body, 
        errors: errors.array(),
        create:true
      });
      return;
    }
    else {
      if(req.body.status!='管理员')req.body.status='普通用户';
      let user = new User(
        {
          name:req.body.name,
          password:req.body.password,
          phonenumber:req.body.phonenumber,
          status:req.body.status
        });
      user.save(
        function(err){
          if(err){ return next(err); }
          res.redirect(user.url);
        }
        );
    }
  }
];

exports.user_delete_get = function(req, res, next)  {
  async.parallel({
    user: function(callback) {
      User.findById(req.params.id).exec(callback)
    },
    user_realyrooms: function(callback) {
      Realyroom.find({ 'user': req.params.id })
      .populate('room')
      .exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.user==null) {
        res.redirect('/catalog/users');
    }
    res.render(H+'_delete', { title: '删除'+h, user: results.user, user_realyrooms: results.user_realyrooms } );
});
};//title、user、user_realyrooms
//user_delete

exports.user_delete_post = function(req, res, next)  {
  async.parallel({
    user: function(callback) {
      User.findById(req.body.userid).exec(callback)
    },
    user_realyrooms: function(callback) {
      Realyroom.find({ 'user': req.body.userid })
      .populate('room')
      .exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.user_realyrooms.length > 0) {
        res.render(H+'_delete', { title: '删除'+h, user: results.user, user_realyrooms:results.user_realyrooms } );
        return;
    }
    else {
        User.findByIdAndRemove(req.body.userid, function(err) {if (err) { return next(err); }res.redirect('/catalog/users')});
    }
});};

exports.user_update_get = function(req, res, next)  {
  async.parallel(
    {
      user: function(callback) {
        User.findById(req.params.id).exec(callback);
      }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) {
            let err = new Error('没找到该'+h);
            err.status = 404;
            return next(err);
        }

        res.render(H+'_form', { title: '更新'+h, user: results.user });
    }
);
};//title、user
//user_form

exports.user_update_post = [
  body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明'),body('phonenumber').isLength({ min: 1 }).trim().withMessage('手机号码必须具体说明'),sanitizeBody('name').trim().escape(),sanitizeBody('phonenumber').trim().escape(),
  sanitizeBody('password').escape(),
  function(req, res, next)  {
    const errors = validationResult(req);
    if(req.body.status!='管理员')req.body.status='普通用户';
    let user = new User({name:req.body.name,password:req.body.password,phonenumber:req.body.phonenumber,status:req.body.status,_id:req.params.id});
    if (!errors.isEmpty()){res.render(H+'_form', { title: '创建'+h, user: user, errors: errors.array() });return}
    else {
      User.findByIdAndUpdate(req.params.id, user, {}, function(err,theuser) {if (err) { return next(err); }res.redirect(theuser.url);});
    }
  }
];

exports.user_search_get=function(req,res,next){
  res.render('user_search_form',{title:'查找用户'})
};
exports.user_search_post=[
  body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明'),body('phonenumber').isLength({ min: 1 }).trim().withMessage('手机号码必须具体说明'),sanitizeBody('name').trim().escape(),sanitizeBody('phonenumber').trim().escape(),
  function(req,res,next){
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      res.render('user_search_form',{title:'查找用户',user:req.body,errors:errors.array()});
      return;
    }
    User.findOne({'name':req.body.name,'phonenumber':req.body.phonenumber})
    .exec(function(err,user){
      if (err) { return next(err); }
      if(user===null){
        let errorno='找不到这个用户';
        res.render('user_search_form',{title:'查找用户',user:req.body,errorno:errorno});
        return;
      }else{
        res.render('yes_form',{title:'输入该用户口令，或者管理员口令',myswitch:req.body.myswitch,thisuserid:user._id})
        return;
      }
    })
  }
];
//找不到
    //title、user、errorno
    //user_search_form
//找到
    //title、myswitch、thisuser
    //yes_form

//res.redirect('/catalog/user/'+user._id.toString());

exports.yes_update_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入口令，以区分用户身份与管理员身份',
      myswitch:'userupdate',
      thisuserid:req.params.id
    });
    return;
};

exports.yes_delete_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:'userdelete',
      thisuserid:req.params.id
    });
    return;
}; 

exports.yes_list_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'list',
    });
    return;
};