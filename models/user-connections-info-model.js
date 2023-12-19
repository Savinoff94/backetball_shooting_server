const {Schema, model} = require('mongoose');

const UserConnectionsInfoSchema = new Schema({
    friends: {type:Array, default:[], required:true},
    pendingOtherUsersFriendRequests: {type:Array, default:[], required:true},
    pendingThisUsersFriendRequests: {type:Array, default:[], required:true},
   
})

module.exports = model('UserConnectionsInfo', UserConnectionsInfoSchema);