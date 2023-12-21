const {Schema, model} = require('mongoose');

const UserSimpleStatsSchema = new Schema({
    freethrows: {type:Number, default:0, required:true},
    twoPointers: {type:Number, default:0, required:true},
    threePointers: {type:Number, default:0, required:true},
})

module.exports = model('UserSimpleStats', UserSimpleStatsSchema);