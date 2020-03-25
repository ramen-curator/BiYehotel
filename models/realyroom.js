const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

let a=['已住人','空闲','维护','保留'];
let ab='空闲';

const RealyroomSchema = new Schema(
    {
        room:{type:Schema.Types.ObjectId,ref:'Room',required:true},
        roomnumber:{type:Number,required:true},
        situation:{type:String,enum:a,default:ab},
        dateend:{type:Date,default:Date.now},
        user:{type:Schema.Types.ObjectId,ref:'User',required:true}
    }
);
 
RealyroomSchema
  .virtual('dateend_f')
  .get(function(){return moment(this.dateend).format('YYYY年M月D日');});

RealyroomSchema
  .virtual('url')
  .get(function(){ return '/catalog/realyroom/' + this._id; } );

module.exports = mongoose.model('Realyroom',RealyroomSchema);

