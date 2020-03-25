const Room = require('../models/room');
const User = require('../models/user');
const Genre = require('../models/genre');
const Realyroom = require('../models/realyroom');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');

let h='房间类型';
let H='genre'

exports.genre_list = function(req, res, next) {
    Genre.find({})
    .sort([['name', 'ascending']])
    .exec( function(err, list_genres) {
      if (err) { return next(err); } 
      res.render(H+'_list', { title: h+'列表', genre_list: list_genres });
    });
};//title、genre_list
//genre_list


exports.genre_detail = function(req, res, next) {
  async.parallel(
    {
      genre: function(callback){
        Genre.findById(req.params.id)
          .exec(callback);
      },

      genre_rooms: function(callback) {
        Room.find({ 'genre': req.params.id })
          .exec(callback);
      },
    } , 
    function(err, results)
    {
      if (err) { return next(err); }
      if (results.genre==null) {
        let err = new Error('没有找到'+h);
        err.status = 404;
        return next(err);
      }
      res.render('genre_detail', { title: h+'详情', genre: results.genre, genre_rooms: results.genre_rooms } )
    });
};//title、genre、genre_rooms
//genre_detail

exports.genre_create_get = function(req, res, next)  {
  res.render(H+'_form', { title: '创建'+h });
};//title
//genre_form

exports.genre_create_post = [
  body('name', '类型名不能为空').isLength({ min: 1 }).trim(),sanitizeBody('name').trim().escape(),
  function(req, res, next)  {
    const errors = validationResult(req);
    var genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {res.render('genre_form', { title: '创建'+h, genre: genre, errors: errors.array()});return;}
    else{
      Genre.findOne({ 'name': req.body.name })
      .exec( function(err, found_genre) {
        if(err){return next(err);}
        if (found_genre) {res.redirect(found_genre.url);}
        else{genre.save(function(err){if(err){return next(err);}res.redirect(genre.url);})}
      })
    }
  }
];

exports.genre_delete_get = function(req, res, next)  {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id).exec(callback)
    },
    genre_rooms: function(callback) {
      Room.find({ 'genre': req.params.id })
      .populate('room')
      .exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.genre==null) {
        res.redirect('/catalog/genres');
    }
    res.render(H+'_delete', { title: '删除'+h, genre: results.genre, genre_rooms: results.genre_rooms } );
});
};//title、genre、genre_rooms
//genre_delete

exports.genre_delete_post = function(req, res, next)  {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.genreid).exec(callback)
    },
    genre_rooms: function(callback) {
      Room.find({ 'genre': req.body.genreid })
      .populate('genre')
      .exec(callback)
    },
}, function(err, results) {
    if (err) { return next(err); }
    if (results.genre_rooms.length > 0) {
        res.render(H+'_delete', { title: '删除'+h, genre: results.genre, genre_rooms:results.genre_rooms } );
        return;
    }
    else {
        Genre.findByIdAndRemove(req.body.genreid, function(err) {if (err) { return next(err); }res.redirect('/catalog/genres')});
    }
});
};

exports.genre_update_get = function(req, res, next)  {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) {
            let err = new Error('没找到该'+h);
            err.status = 404;
            return next(err);
        }
        res.render(H+'_form', { title: '更新'+h, genre: results.genre });
    }
);
};//title、genre
//genre_form

exports.genre_update_post = [
  body('name', '类型名不能为空').isLength({ min: 1 }).trim(),sanitizeBody('name').trim().escape(),
  function(req, res, next)  {
    const errors = validationResult(req);
    let genre = new Genre({name:req.body.name,_id:req.params.id});
    if (!errors.isEmpty()){res.render(H+'_form', { title: '创建'+h, genre: genre, errors: errors.array() });return}
    else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err,thegenre) {if (err) { return next(err); }res.redirect(thegenre.url);});
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