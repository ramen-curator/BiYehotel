const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        name:{type:String,required:true},
        status:{type:String,enum:['管理员','普通用户'],retuqire:true,default:'普通用户'},
        password:{type:String,required:true},
        phonenumber:{type:String,required:true}
    }
);

UserSchema
  .virtual('url') 
  .get(function(){ return '/catalog/user/' + this._id; } );

module.exports = mongoose.model('User',UserSchema);