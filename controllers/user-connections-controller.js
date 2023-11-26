const userConnectionsService = require('../service/user-connections-service')
const userStatsService = require('../service/user-stats-service');

class UserConnectionsController {
    
    //filled with users info
    async getUserConnections(req,res,next) {

        try{

            const userData = await req.user;

            const userId = userData.id;

            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            
            const userConnections = await userConnectionsService.getUserConnections(userConnectionsInfo);

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
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;

            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);

            await userConnectionsService.friendRequest(userConnectionsInfo, ids, userId);

            await userConnectionsService.friendRequestSideEffect(userId, ids);

            return res.sendStatus(200);

        } catch (error) {
            
            next(error);
        }

    }
    async cancelFriendRequest(req,res,next) {
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.cancelFriendRequest(userConnectionsInfo, ids, userId);
            await userConnectionsService.cancelFriendRequestSideEffect(userId, ids);

            return res.sendStatus(200);
            
        } catch (error) {
            
            next(error);
        }

    }
    async approveFriendRequest(req,res,next) {
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.approveFriendRequest(userConnectionsInfo, ids, userId);
            await userConnectionsService.approveFriendRequestSideEffect(userId, ids);

            return res.sendStatus(200);
            
        } catch (error) {
            
            next(error);
        }

    }
    async disapproveFriendRequest(req,res,next) {
        
        try {
            
            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.disapproveFriendRequest(userConnectionsInfo, ids, userId);
            await userConnectionsService.disapproveFriendRequestSideEffect(userId, ids);
            
            return res.sendStatus(200);
            
        } catch (error) {
            
            next(error);
        }

    }
    async removeFriendRequest(req,res,next) {
        
        try {

            const userData = await req.user;
            const userId = userData.id;
            const {ids} = req.body;
            
            
            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);
            await userConnectionsService.removeFriendRequest(userConnectionsInfo, ids, userId);
            await userConnectionsService.removeFriendRequestSideEffect(userId, ids);

            return res.sendStatus(200);
            
        } catch (error) {
            
            next(error);
        }

    }
}

module.exports = new UserConnectionsController();