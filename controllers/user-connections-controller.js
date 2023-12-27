const userConnectionsService = require('../service/user-connections-service')
const userStatsService = require('../service/user-stats-service');
const userService = require('../service/user-service');
const { default: mongoose } = require('mongoose');

class UserConnectionsController {

    //filled with users info
    async getUserConnections(req,res,next) {

        try {

            const userData = await req.user;

            const userId = userData.id;

            const userConnectionsDto = await userConnectionsService.getUserConnectionsDtoByUserId(userId);
            const allConncectedUsersIds = [].concat(...Object.values(userConnectionsDto));

            const usersDocuments = await userService.getUsersDocumentsById(allConncectedUsersIds);

            const {userDtosMap, userReferencesDtosMap} = userService.getEveryUserDtoMap(usersDocuments)

            const userSimpleStatsDtosMap = await userStatsService.getSimpleStatsByUserReferenceDtoMap(userReferencesDtosMap);
            const userConnectionsTypes = Object.keys(userConnectionsDto);

            const result = {};

            for(const userConncetionType of userConnectionsTypes) {

                if(!(userConncetionType in result)) {

                    result[userConncetionType] = {}
                }
            
                const currentConnectionTypeIds = userConnectionsDto[userConncetionType]

                currentConnectionTypeIds.forEach((currentConnectionTypeId) => userService.fillUserInfoFromDto(result[userConncetionType], currentConnectionTypeId, userDtosMap, userSimpleStatsDtosMap))
            }

            return res.json(result);
            
        } catch (error) {
            
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


            await userConnectionsService.friendRequest(userId, ids, {session})
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
            
            
            await userConnectionsService.cancelFriendRequest(userId, ids, {session});
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
            
            
            await userConnectionsService.approveFriendRequest(userId, ids, {session});
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
            
            
            await userConnectionsService.disapproveFriendRequest(userId, ids, {session});
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
            
            
            await userConnectionsService.removeFriendRequest(userId, ids, {session});
            await userConnectionsService.removeFriendRequestSideEffect(userId, ids, session);

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