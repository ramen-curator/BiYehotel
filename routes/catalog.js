const express = require('express');
const router = express.Router();


const genre_controller = require('../controllers/genreController');
const realyroom_controller = require('../controllers/realyroomController');
const room_controller = require('../controllers/roomController');
const user_controller = require('../controllers/userController');


/// room 房间种类///

router.get('/', room_controller.index);

router.post('/yes',room_controller.yes_post); 


router.get('/room/create', room_controller.room_create_get);
router.post('/room/create', room_controller.room_create_post);
router.get('/room/yescreate',room_controller.yes_create_get);

router.get('/room/:id/delete', room_controller.room_delete_get);
router.post('/room/:id/delete', room_controller.room_delete_post);
router.get('/room/:id/yesdelete', room_controller.yes_delete_get);

router.get('/room/:id/update', room_controller.room_update_get);
router.post('/room/:id/update', room_controller.room_update_post);
router.get('/room/:id/yesupdate', room_controller.yes_update_get);

router.get('/room/:id', room_controller.room_detail);
router.get('/rooms', room_controller.room_list);

/// user 用户///

router.get('/user/create', user_controller.user_create_get);
router.post('/user/create', user_controller.user_create_post);
router.get('/user/search',user_controller.user_search_get);
router.post('/user/search',user_controller.user_search_post);

router.get('/user/:id/delete', user_controller.user_delete_get);
router.post('/user/:id/delete', user_controller.user_delete_post);
router.get('/user/:id/yesdelete', user_controller.yes_delete_get);


router.get('/user/:id/update', user_controller.user_update_get);
router.post('/user/:id/update', user_controller.user_update_post);
router.get('/user/:id/yesupdate',user_controller.yes_update_get);

router.get('/user/:id', user_controller.user_detail);
router.get('/users', user_controller.user_list);
router.get('/yesusers', user_controller.yes_list_get);

/// genre 房间类型 ///


router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);
router.get('/genre/yescreate', genre_controller.yes_create_get);

router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);
router.get('/genre/:id/yesdelete', genre_controller.yes_delete_get);

router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);
router.get('/genre/:id/yesupdate', genre_controller.yes_update_get);

router.get('/genre/:id', genre_controller.genre_detail);
router.get('/genres', genre_controller.genre_list);

/// realyroom 具体房间 ///


router.get('/realyroom/create', realyroom_controller.realyroom_create_get);
router.post('/realyroom/create', realyroom_controller.realyroom_create_post);
router.get('/realyroom/yescreate', realyroom_controller.yes_create_get);

router.get('/realyroom/:id/delete', realyroom_controller.realyroom_delete_get);
router.post('/realyroom/:id/delete', realyroom_controller.realyroom_delete_post);
router.get('/realyroom/:id/yesdelete', realyroom_controller.yes_delete_get);

router.get('/realyroom/:id/update', realyroom_controller.realyroom_update_get);
router.post('/realyroom/:id/update', realyroom_controller.realyroom_update_post);
router.get('/realyroom/:id/yesupdate', realyroom_controller.yes_update_get);

router.get('/realyroom/:id', realyroom_controller.realyroom_detail);
router.get('/realyrooms', realyroom_controller.realyroom_list);


module.exports = router;