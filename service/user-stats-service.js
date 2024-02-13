const UserModel = require('../models/user-model');
const UserSimpleStatsModel = require('../models/user-simple-stats-model');
const ApiError = require('../exeptions/api-error');
const UserSimpleStatsDto = require('../dtos/user-simple-stats-dto');
const userServise = require('../service/user-service');


class UserStatsService {

    async getUsersSimpleStats(usersIds) {

        const simpleStatsArray = await Promise.all(

            usersIds.map((userId) => {

                return UserSimpleStatsModel.findOne({ holderUserId: userId })
            })
        );
    
        const result = {};
    
        simpleStatsArray.forEach(simpleStats => {

            if(!simpleStats) {

                return;
            }

            result[simpleStats.holderUserId] = new UserSimpleStatsDto(simpleStats);
        });
    
        return result;
    }

    async fillSimpleStatsInUsers(users) {

        const usersSimpleStats = await this.getUsersSimpleStats(Object.keys(users));

        const usersWithSimpleStats = userServise.fillUsersWithSimpleStats(users, usersSimpleStats);

        return usersWithSimpleStats;
    }

    async getUserSimpleStatsDto(simpleStatsId) {
    
        const userSimpleStatsDocument = await UserSimpleStatsModel.findById(simpleStatsId);

        const userSimpleStatsDto = new UserSimpleStatsDto(userSimpleStatsDocument);
        
        return userSimpleStatsDto;
    }

    async getSimpleStatsByUserReferenceDtoMap(userReferenceDtoMap) {

        const result = {};

        const usersIds = Object.keys(userReferenceDtoMap);

        for(const userId of usersIds) {

            const userReferencesDto = userReferenceDtoMap[userId];

            const {userSimpleStatsId} = userReferencesDto;

            result[userId] = await this.getUserSimpleStatsDto(userSimpleStatsId);
        }

        return result;
    }

    async getUserSimpleStatsDocument(userReferenceDto) {

        const {userSimpleStatsId} = userReferenceDto;

        return await UserSimpleStatsModel.findById(userSimpleStatsId);
    }
}

module.exports = new UserStatsService();
