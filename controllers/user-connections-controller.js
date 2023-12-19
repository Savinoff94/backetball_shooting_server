const userConnectionsService = require('../service/user-connections-service')
const userStatsService = require('../service/user-stats-service');
const userService = require('../service/user-service');
const { default: mongoose } = require('mongoose');

class UserConnectionsController {
    
    //filled with users info
    async getUserConnections(req,res,next) {

        try{

            const userData = await req.user;

            const userId = userData.id;

            const userConnectionsDto = await userConnectionsService.getUserConnectionsDtoByUserId(userId);
            
            const userConnections = await userConnectionsService.getUserConnectionsFilledWithUsers(userConnectionsDto);
 
            const userConnectionsTypes = Object.keys(userConnections);

            for(const userConncetionType of userConnectionsTypes) {

                const currentTypeConnections = userConnections[userConncetionType];

                userConnections[userConncetionType] = await userStatsService.fillSimpleStatsInUsers(currentTypeConnections)
            }

            return res.json(userConnections);

        }catch(error) {

            next(error);
        }
    }

    async friendRequest(req,res,next) {

        const session = await mongoose.startSession();

        session.startTransaction();

        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;

            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.friendRequest(userConnectionsInfo, ids, userId, session);
            await userConnectionsService.friendRequestSideEffect(userId, ids, session);

            await session.commitTransaction();

            return res.sendStatus(200);

        } catch (error) {

            await session.abortTransaction();
            
            next(error);
        }

    }
    async cancelFriendRequest(req,res,next) {

        const session = await mongoose.startSession();

        session.startTransaction();
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.cancelFriendRequest(userConnectionsInfo, ids, userId, session);
            await userConnectionsService.cancelFriendRequestSideEffect(userId, ids, session);

            await session.commitTransaction();

            return res.sendStatus(200);
            
        } catch (error) {

            await session.abortTransaction();
            
            next(error);
        }

    }
    async approveFriendRequest(req,res,next) {

        const session = await mongoose.startSession();

        session.startTransaction();
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.approveFriendRequest(userConnectionsInfo, ids, userId, session);
            await userConnectionsService.approveFriendRequestSideEffect(userId, ids, session);

            await session.commitTransaction();

            return res.sendStatus(200);
            
        } catch (error) {

            await session.abortTransaction();
            
            next(error);
        }

    }
    async disapproveFriendRequest(req,res,next) {

        const session = await mongoose.startSession();

        session.startTransaction();
        
        try {
            
            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.disapproveFriendRequest(userConnectionsInfo, ids, userId, session);
            await userConnectionsService.disapproveFriendRequestSideEffect(userId, ids, session);

            await session.commitTransaction();
            
            return res.sendStatus(200);
            
        } catch (error) {

            await session.abortTransaction();
            
            next(error);
        }

    }
    async removeFriendRequest(req,res,next) {

        const session = await mongoose.startSession();

        session.startTransaction();
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.removeFriendRequest(userConnectionsInfo, ids, userId, session);
            await userConnectionsService.removeFriendRequestSideEffect(userId, ids, session, session);

            await session.commitTransaction();

            return res.sendStatus(200);
            
        } catch (error) {

            await session.abortTransaction();
            
            next(error);
        }

    }
    async getTrainingSquadList(req,res,next) {

        try {

            const userData = await req.user;

            const userId = userData.id;

            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);

            const trainingSquadIds = [...userConnectionsInfo['friends'], userId];

            const trainingSquadUsersMap = await userService.getUsersById(trainingSquadIds);

            const trainingSquadList = await userStatsService.fillSimpleStatsInUsers(trainingSquadUsersMap)

            return res.json(trainingSquadList);
            
        } catch (error) {
            
            next(error);
        }
    }
}

module.exports = new UserConnectionsController();