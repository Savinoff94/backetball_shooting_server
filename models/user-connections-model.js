const {Schema, model} = require('mongoose');

const UserConnectionsSchema = new Schema({
    holderUserId: {type:String, unique:true, required: true},
    fiends: {type:Array, default:[], required:true},
    pendingOtherUsersFriendRequests: {type:Array, default:[], required:true},
    pendingThisUserFriendRequests: {type:Array, default:[], required:true},
   
})

module.exports = model('UserConnections', UserConnectionsSchema);