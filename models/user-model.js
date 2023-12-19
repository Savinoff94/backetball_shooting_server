const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    login: {type:String, unique:true, required:true},
    email: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    shootingDiaryId: { type: Schema.Types.ObjectId, ref: 'ShootingTrainingDiary', unique:false, required:false },
    userConnectionsId: { type: Schema.Types.ObjectId, ref: 'UserConnectionsInfo', unique:false, required:false },
    userSimpleStatsId: { type: Schema.Types.ObjectId, ref: 'UserSimpleStats', unique:false, required:false },
    // isActivated: {type:Boolean, default:false},
    // activationLink: {type: String},
})

module.exports = model('User', UserSchema);