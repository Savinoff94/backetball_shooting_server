const ApiError = require('../exeptions/api-error')
const userServise = require('../service/user-service');
const UserModel = require('../models/user-model');


module.exports = async function(req,res,next) {
    
    try {

        const userData = await req.user;
        const userId = userData.id;

        await userServise.createUserRelatedDocuments(await UserModel.findById(userId));
        
        next()

    } catch (error) {
        return next(error)
    }
}