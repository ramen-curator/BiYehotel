#! /usr/bin/env node

console.log('此脚本为数据库填充一些测试房间种类、用户、房间类型、具体房间。将数据库地址作为参数，比如：populatedb mongodb://your_username:your_password@your_dabase_url。');

// 从命令行取得参数
const userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
  console.log('错误：需要指定一个合法的 MongoDB URL 作为第一个参数。');
  return;
}

const async         = require('async');
const Room = require('./models/room');
const User = require('./models/user');
const Genre = require('./models/genre');
const Realyroom = require('./models/realyroom');

const mongoose      = require('mongoose');
const mongoDB       = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise    = global.Promise;

const db            = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));

const users       = [];
const genres        = [];
const rooms         = [];
const realyrooms = [];

function userCreate(name, status, password, phonenumber, cb) {
  const user = new User({
    name:name,
    status:status,
    password:password,
    phonenumber,phonenumber
  });
     
  user.save( err => {
    if (err) {cb(err, null);return;}
    console.log('新建用户：' + user);
    users.push(user);
    cb(null, user);
  });
}

function genreCreate(name, cb) {
  const genre = new Genre({ name: name });   
  genre.save( err => {
    if (err) {cb(err, null);return;}
    console.log('新建房间类型：' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function roomCreate(name, summary, genre, cb) {
  const room = new Room({
    name:name,
    summary:summary,
    genre:genre
  });
  room.save( err => {
    if (err) {cb(err, null);return;}
    console.log('新建房间种类：' + room);
    rooms.push(room);
    cb(null, room);
  });
}

function realyroomCreate(room, roomnumber, situation, dataend, user, cb) {
  const realyroom = new Realyroom({
    room: room,
    roomnumber:roomnumber,
    situation:situation,
    dataend:dataend,
    user:user
  });
  realyroom.save( err => {
    if (err) {cb(err, null);return;}
    console.log('新建具体房间：' + realyroom);
    realyrooms.push(realyroom);
    cb(null, room);
  });
}


function createGenres(cb) {
  async.parallel([
    callback => genreCreate('单人房', callback),
    callback => genreCreate('双人房', callback),
    callback => genreCreate('豪华房', callback),
    callback => genreCreate('总统套房', callback),
    callback => genreCreate('测试房', callback)
  ], cb); // 可选回调
}

function createUsers(cb) {
  async.parallel([
    callback => userCreate('无', '管理员', 'a12345', '0', callback),
    callback => userCreate('小明1号', '管理员', 'abc123', '1', callback),
    callback => userCreate('小红1号', '普通用户', 'a123', '13113111321', callback),
    callback => userCreate('小红2号', '普通用户', 'b123', '13113111322', callback),
    callback => userCreate('小红3号', '普通用户', 'c123', '13113111323', callback),
    callback => userCreate('小红4号', '普通用户', 'd123', '13113111324', callback),
    callback => userCreate('小红5号', '普通用户', 'e123', '13113111325', callback),
  ], cb); // 可选回调
}

function createRooms(cb) {
  async.parallel([
    callback => roomCreate(
      '阳光大床房',
      '您将受到阳光直射',
      [genres[0],],
      callback
    ),
    callback => roomCreate(
        '露天大床房',
        '您的天花板将有一个“天”字',
        [genres[0],],
        callback
      ),
    callback => roomCreate(
      '情侣大床房',
      '您将收到1个情侣',
      [genres[1],],
      callback
    ),
    callback => roomCreate(
        '本店招聘房',
        '您将有2个床',
        [genres[3],],
        callback
    ),
    callback => roomCreate(
        '本店至尊房',
        '您将有直升飞机专门接送',
        [genres[4],],
        callback
      ),
  ], cb); // 可选回调
}

function createRealyrooms(cb) {
  async.parallel([
    callback => realyroomCreate(
        rooms[0], '101', '已住人', '2018-9-25',users[2], callback
    ),
    callback => realyroomCreate(
        rooms[0], '102', '空闲', '2020-9-25',users[0], callback
    ),
    callback => realyroomCreate(
        rooms[1], '201', '已住人', '2021-9-25',users[3], callback
    ),
    callback => realyroomCreate(
        rooms[1], '202', '空闲', '2023-9-25',users[0], callback
    ),
    callback => realyroomCreate(
        rooms[2], '301', '空闲', '2023-9-25',users[0], callback
    ),
    callback => realyroomCreate(
        rooms[3], '401', '保留', '2024-9-25',users[1], callback
    ),
    callback => realyroomCreate(
        rooms[3], '402', '维护', '2022-9-25',users[1], callback
    ),
  ], cb); // 可选回调
}

async.series (
  [
    createGenres,
    createUsers,
    createRooms,
    createRealyrooms
  ],
  // 可选回调
  (err, results) => {
    console.log(
      err ?
      '最终错误：' + err :'无误'
    );
    // 操作完成，断开数据库连接
    db.close();
  }
);