const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
    {
        name:{type:String,required:true,max:30},
        summary:{type:String,required:true,max:300},
        genre:[{type:Schema.Types.ObjectId,ref:'Genre'}]
    }
);

RoomSchema
  .virtual('url')
  .get(function(){
    return '/catalog/room/' + this._id;
  });

module.exports = mongoose.model('Room',RoomSchema);