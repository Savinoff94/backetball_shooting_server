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
}

module.exports = new UserStatsService();
