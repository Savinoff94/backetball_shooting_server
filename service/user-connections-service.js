const UserConnectionsInfoModel = require('../models/user-connections-info-model');
const UserConnectionsInfoDto = require('../dtos/user-connections-info-dto')
const ApiError = require('../exeptions/api-error');
const userService = require('./user-service');


class UserConnectionsService {

    async getUserConnectionsInfoByUserId(userId) {

        const userConncectionsInfo = await UserConnectionsInfoModel.findOne({holderUserId: userId});

        const userConnectionsInfoDto = new UserConnectionsInfoDto(userConncectionsInfo);

        return userConnectionsInfoDto;
    }

    async getUserConnections(userConncetionsInfo) {

        const userConnections = {};

        const userConnectionsTypes = Object.keys(userConncetionsInfo);

        await userConnectionsTypes.forEach(async (userConncetionType) => {

            const currentTypeUserIds = userConncetionsInfo[userConncetionType];

            userConnections[userConncetionType] = await userService.getUsersById(currentTypeUserIds);

        });

        return userConnections;
    }
    
}

module.exports = new UserConnectionsService();
