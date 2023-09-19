const {Schema, model} = require('mongoose');

const UserSimpleStatsSchema = new Schema({
    holderUserId: {type:String, unique:true, required: true},
    freethrows: {type:Number, default:0, required:true},
    twoPointers: {type:Number, default:0, required:true},
    threePointers: {type:Number, default:0, required:true},
})

module.exports = model('UserSimpleStats', UserSimpleStatsSchema);