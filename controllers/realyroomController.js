const Room = require('../models/room');
const User = require('../models/user');
const Genre = require('../models/genre');
const Realyroom = require('../models/realyroom');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');

let h='具体房间';
let H='realyroom'
 
exports.realyroom_list = function(req, res, next)  {
    Realyroom.find()
    .populate('room')
    .exec( function(err, list_realyrooms) {
      if (err) { return next(err); }
      res.render('realyroom_list', { title: h+'列表', realyroom_list: list_realyrooms });
    });
};//title
//realyroom_list

exports.realyroom_detail = function(req, res, next)  {
  Realyroom.findById(req.params.id)
    .populate('room')
    .exec( function(err, realyroom) {
      if (err) { return next(err); }
      if (realyroom==null) {
          const err = new Error('找不到该'+h);
          err.status = 404;
          return next(err);
        }
      res.render('realyroom_detail', { title: h+'：', realyroom:  realyroom});
    })
};//title 、realyroom

exports.realyroom_create_get = function(req, res, next)  {
  async.parallel(
    {
      rooms: function(callback) {Room.find(callback);},
      users: function(callback){User.find(callback);}
    }, 
    function(err, results) {
        if (err) { return next(err); }
        res.render(H+'_form', { title: '创建'+h, rooms:results.rooms, users:results.users });
    }
  );
};//title、room_list、user_list
//realyroom_form

exports.realyroom_create_post = [
  body('roomnumber', '房间号必须被具体说明').isLength({ min: 1 }).trim(),
  body('room', '房间种类必须被具体说明').isLength({ min: 1 }).trim(),
  body('user', '住着的用户必须被具体说明').isLength({ min: 1 }).trim(),
  body('dateend', '无效日期').optional({ checkFalsy: true }).isISO8601(),
  sanitizeBody('roomnumber').trim().escape(),
  sanitizeBody('room').trim().escape(),
  sanitizeBody('situation').trim().escape(),
  sanitizeBody('user').trim().escape(),
  sanitizeBody('dateend').toDate(),
  function(req, res, next) {
    const errors = validationResult(req);
    let realyroom = new Realyroom(
      { 
        room: req.body.room,
        roomnumber: req.body.roomnumber,
        situation: req.body.situation,
        user:req.body.user,
        dateend: req.body.dateend
      });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          rooms: function(callback) {Room.find(callback);},
          users: function(callback){User.find(callback);}
        }, 
        function(err, results) {
            if (err) { return next(err); }
            res.render(H+'_form', { title: '创建'+h, rooms:results.rooms, users:results.users,realyroom:realyroom,errors: errors.array()});
        }
      );
      return;
    }
    else{
      realyroom.save(function(err){if(err){return next(err);}res.redirect(realyroom.url);});
    }
  }

];

exports.realyroom_delete_get = function(req, res, next)  {
  async.parallel({
    realyroom: function(callback) {
      Realyroom.findById(req.params.id)
      .populate('room')
      .populate('user')
      .exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.realyroom==null) {
        res.redirect('/catalog/realyrooms');
    }
    res.render(H+'_delete', { title: '删除'+h, realyroom: results.realyroom} );
});
};//title、realyroom
//realyroom_delete

exports.realyroom_delete_post = function(req, res, next)  {
  async.parallel({

}, function(err, results) {
    if (err) { return next(err); }
    else {
      Realyroom.findByIdAndRemove(req.body.realyroomid, function(err) {if (err) { return next(err); }res.redirect('/catalog/realyrooms')});
    }
});
};

exports.realyroom_update_get = function(req, res, next)  {
  async.parallel(
    {
      realyroom: function(callback) {
        Realyroom.findById(req.params.id).populate('room').populate('user').exec(callback);
      },
      rooms: function(callback) {Room.find(callback);},
      users: function(callback){User.find(callback);}
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.realyroom==null) {
            let err = new Error('没找到该'+h);
            err.status = 404;
            return next(err);
        } 
        res.render(H+'_form', { title: '更新'+h, rooms:results.rooms, users: results.users,realyroom:results.realyroom });
    }
);
};

exports.realyroom_update_post = [
  body('roomnumber', '房间号必须被具体说明').isLength({ min: 1 }).trim(),
  body('room', '房间种类必须被具体说明').isLength({ min: 1 }).trim(),
  body('user', '住着的用户必须被具体说明').isLength({ min: 1 }).trim(),
  body('dateend', '无效日期').optional({ checkFalsy: true }).isISO8601(),
  sanitizeBody('roomnumber').trim().escape(),
  sanitizeBody('room').trim().escape(),
  sanitizeBody('situation').trim().escape(),
  sanitizeBody('user').trim().escape(),
  sanitizeBody('dateend').toDate(),  
  function(req, res, next)  {
    const errors = validationResult(req);
    let realyroom = new Realyroom(
      { 
        room: req.body.room,
        roomnumber: req.body.roomnumber,
        situation: req.body.situation,
        user:req.body.user,
        dateend: req.body.dateend,
        _id:req.params.id
      }
    );

    if (!errors.isEmpty()) {
      async.parallel(
        {
          rooms: function(callback) {Room.find(callback);},
          users: function(callback){User.find(callback);}
        }, 
        function(err, results) {
            if (err) { return next(err); }
            res.render(H+'_form', { title: '更新'+h, rooms:results.rooms, users:results.users,realyroom:realyroom,errors: errors.array()});
        }
      );
      return;
    }else {
      Realyroom.findByIdAndUpdate(req.params.id, realyroom, {}, function(err,therealyroom) {if (err) { return next(err); }res.redirect(therealyroom.url);});
    }
  }
];

exports.yes_create_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'create',
    });
};
exports.yes_update_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'update',
      theid:req.params.id
    });
};
exports.yes_delete_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'delete',
      theid:req.params.id
    });
};