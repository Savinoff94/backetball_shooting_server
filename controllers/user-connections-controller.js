const userConnectionsService = require('../service/user-connections-service')

class UserConnectionsController {

    async getUserConnections(req,res,next) {

        try{

            const {userId} = req.body;

            const userConnectionsInfo = await userConnectionsService.getUserConnectionsInfoByUserId(userId);

            const userConnections = await userConnectionsService.getUserConnections(userConnectionsInfo);

            return res.json(userConnections);

        }catch(error) {

            next(error);
        }
    }
    
    
}

module.exports = new UserConnectionsController();