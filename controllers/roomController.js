const Room = require('../models/room');
const User = require('../models/user');
const Genre = require('../models/genre');
const Realyroom = require('../models/realyroom');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');

let h='房间种类';
let H='room';


exports.index = function(req, res, next)  {
    async.parallel({
        room_count:  function(callback) {
            Room.count({}, callback); 
        },
        realyroom_count: function (callback) {
            Realyroom.count({}, callback);
        },
        realyroom_available_count:  function(callback) {
            Realyroom.count({situation:'空闲'}, callback);
        },
        user_count:  function(callback) {
            User.count({}, callback);
        },
        genre_count:  function(callback) {
            Genre.count({}, callback);
        },
    },  function(err, results) {
        res.render('index', { title: '酒店管理系统首页', error: err, data: results });
    });
};// title 、 error 、 data
//index

exports.room_list = function(req, res, next)  {
    Room.find({})
    .populate('genre')
    .exec(function (err, list_rooms) {
      if (err) { return next(err); }
      res.render(H+'_list', { title: h+'列表', room_list: list_rooms });
    });
};//title 、 room_list
//room_list

exports.room_detail = function(req, res, next)  {
    async.parallel({
        room: function(callback) {
            Room.findById(req.params.id)
              .populate('genre')
              .exec(callback);
        },
        realyroom: function(callback) {
          Realyroom.find({'room': req.params.id})
          .exec(callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        if (results.room==null) {
            let err = new Error('没有找到这个'+h);
            err.status = 404;
            return next(err);
        }
        res.render(H+'_detail', { title: '标题', room: results.room, realyrooms: results.realyroom } );
    });
};//title 、 room 、 realyrooms
//room_detail

exports.room_create_get = function(req, res, next)  {
    async.parallel(
        {genres: function(callback) {Genre.find(callback);},}, 
        function(err, results) {
            if (err) { return next(err); }
            res.render(H+'_form', { title: '创建'+h, genres: results.genres });
        }
    );
};//title、genres
//room_form

exports.room_create_post = [
  function(req, res, next)  {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')req.body.genre=[];
            else req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    body('name', '房间名不能为空').isLength({ min: 1 }).trim(),body('summary', '房间简介不能为空').isLength({ min: 1 }).trim(),sanitizeBody('name').trim().escape(),sanitizeBody('summary').trim().escape(),
    function(req, res, next) {
        const errors = validationResult(req);
        var room = new Room({name:req.body.name,summary:req.body.summary,genre:req.body.genre});
        if (!errors.isEmpty()) {
            async.parallel(
                {genres: function(callback) {Genre.find(callback);},},
                function(err,results){
                    if (err) { return next(err); }
                    for (let i = 0; i < results.genres.length; i++) {
                        if (room.genre.indexOf(results.genres[i]._id) > -1) {results.genres[i].checked='true';}
                    }
                    res.render(H+'_form', { title: '创建'+h, genres:results.genres, room: room, errors: errors.array() });
                }
            );
            return;
        }
        else{
            room.save(function(err) {if(err){return next(err);}res.redirect(room.url);});
        }
    }
];//title、genres、room、errors
//room_form

exports.room_delete_get = function(req, res, next)  {
    async.parallel({
        room: function(callback) {
          Room.findById(req.params.id).exec(callback)
        },
        room_realyrooms: function(callback) {
          Realyroom.find({ 'room': req.params.id })
          .populate('room')
          .populate('user')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.room==null) {
            res.redirect('/catalog/rooms');
        }
        res.render(H+'_delete', { title: '删除'+h, room: results.room, room_realyrooms: results.room_realyrooms } );
    });
};//title、room、room_realyrooms
//room_delete

exports.room_delete_post = function(req, res, next)  {
    async.parallel({
        room: function(callback) {
          Room.findById(req.body.roomid).exec(callback)
        },
        room_realyrooms: function(callback) {
          Realyroom.find({ 'room': req.body.roomid })
          .populate('room')
          .populate('user')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.room_realyrooms.length > 0) {
            res.render(H+'_delete', { title: '删除'+h, room: results.room, room_realyrooms:results.room_realyrooms } );
            return;
        }
        else {
            Room.findByIdAndRemove(req.body.roomid, function(err) {if (err) { return next(err); }res.redirect('/catalog/rooms')});
        }
    });
};

exports.room_update_get = function(req, res, next)  {
    async.parallel(
        {
          room: function(callback) {
            Room.findById(req.params.id).populate('genre').exec(callback);
          },
          genres: function(callback) {
            Genre.find(callback);
          },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.room==null) {
                let err = new Error('没找到该'+h);
                err.status = 404;
                return next(err);
            }
            for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (let room_g_iter = 0; room_g_iter < results.room.genre.length; room_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.room.genre[room_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render(H+'_form', { title: '更新'+h, genres:results.genres, room: results.room });
        }
    );
};//title、genres、room
//room_form

exports.room_update_post = [
  function(req, res, next)  {
    if(!(req.body.genre instanceof Array)){
      if(typeof req.body.genre==='undefined')
      req.body.genre=[];
      else
      req.body.genre=new Array(req.body.genre);
    }
    next();
  },  
  body('name', '房间名不能为空').isLength({ min: 1 }).trim(),body('summary', '房间简介不能为空').isLength({ min: 1 }).trim(),sanitizeBody('name').trim().escape(),sanitizeBody('summary').trim().escape(),

  function(req, res, next)  {

    const errors = validationResult(req);

    let room = new Room(
      { 
        name:req.body.name,
        summary:req.body.summary,
        genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
        _id:req.params.id
      }
    );

    if (!errors.isEmpty()) {
      async.parallel(
        {genres: function(callback) {Genre.find(callback);},}, 
        function(err, results) {
          if (err) { return next(err); }
          for (let i = 0; i < results.genres.length; i++) {
            if (room.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked='true';
            }
          }
          res.render(H+'_form', { title: '更新'+h, genres:results.genres, room: room, errors: errors.array() });
        }
      );
      return;
    }else {
      Room.findByIdAndUpdate(req.params.id, room, {}, function(err,theroom) {if (err) { return next(err); }res.redirect(theroom.url);});
    }
  }
];
 
exports.yes_post=[
  sanitizeBody('password').escape(),
  function(req,res,next){

      if(req.body.myswitch=='search')
        User.findById(req.body.thisuserid).exec(
          function(err,theguy){
            if(err){return next(err);}
            User.findOne({'status':'管理员','password':req.body.password}).exec(
              function(err,trueguy){
                if(err){return next(err);}
                if(req.body.password==theguy.password||trueguy){
                  res.redirect('/catalog/user/'+req.body.thisuserid);
                  return;
                }else{
                  res.redirect('/');
                  return; 
                }
              }
            )
          }
        );

      if (req.body.myswitch=='userupdate')
        User.findById(req.body.thisuserid).exec(
          function(err,theguy){
            if(err){return next(err);}
            User.findOne({'status':'管理员','password':req.body.password}).exec(
              function(err,trueguy){
                if(err){return next(err);}
                if(req.body.password==theguy.password){
                  res.render('user_form', 
                    { 
                      title: '更新用户信息', 
                      user: theguy,
                      create:false,
                      yes:true
                    });
                  return;
                }else{
                  if(trueguy){//不是主人而是管理员。
                    res.render('user_form', 
                      { 
                        title: '更新用户信息', 
                        user: theguy,
                        create:false,
                        yes:false
                      });
                    return;
                  }else{

                  }
                }  
              }
            )
          }
        ) ;
      if(req.body.myswitch=='userdelete')
        User.findById(req.body.thisuserid).exec(
          function(err,theguy){
            if(err){return next(err);}
            User.findOne({'status':'管理员','password':req.body.password}).exec(
              function(err,trueguy){
                if(err){return next(err);}
                if(trueguy){//不是主人而是管理员。
                  res.redirect(theguy.url+'/delete');
                  return;
                }else{
                  res.redirect('/');
                  return;
                }  
              }
            )
          }
        )       
      switch(req.body.myswitch){
        default:
        User.findOne({'status':'管理员','password':req.body.password}).exec(
        function(err,trueguy){
          if(trueguy){
            let A='/catalog';
            let B1='/room/',B2='/realyroom/',B3='/genre/';
            let BB1='room',BB2='realyroom',BB3='genre';
            let C1='create',C2='/update',C3='/delete';
            let CC1='create',CC2='update',CC3='delete';
            let theid=req.body.theid;
            switch(req.body.myswitch){
              case BB1+CC1:
                res.redirect('/catalog/room/create');
                return;
              case BB1+CC2:
                res.redirect('/catalog/room/'+theid+'/update');
                return;
              case BB1+CC3:
                res.redirect('/catalog/room/'+theid+'/delete');
                return;
              case BB2+CC1:
                res.redirect(A+B2+C1);
                return;
              case BB2+CC2:
                res.redirect(A+B2+theid+C2);
                return;
              case BB2+CC3:
                res.redirect(A+B2+theid+C3);
                return;
              case BB3+CC1:
                res.redirect(A+B3+C1);
                return;
              case BB3+CC2:
                res.redirect(A+B3+theid+C2);
                return;
              case BB3+CC3:
                res.redirect(A+B3+theid+C3);
                return;   
              case 'userlist':
                
                res.redirect(A+'/users'); 
                break;          
            }
            return;
          }else{
            res.redirect('/');
            return; 
          }          
        });            
    }
  }
]

exports.yes_create_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'create',
    });
  return;
};
exports.yes_update_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'update',
      theid:req.params.id
    });
    return;
};
exports.yes_delete_get=function(req,res,next){
  res.render('yes_form',
    {
      title:'输入管理员口令',
      myswitch:H+'delete',
      theid:req.params.id
    });
    return;
};
