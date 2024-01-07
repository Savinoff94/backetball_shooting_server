const db = require('../modules/db').db;
const ApiError = require('../exeptions/api-error');
const TrainingSetDto = require('../dtos/training-set-dto');


class ShootingDiaryService {

    saveShootingSet = async (shooterId, currentDateFormatted, spotKey, trainingHostId, tries, makes) => {

        try {

            await db('basketball_shooting_diary').insert({
                shooter_id:            shooterId,
                spot_key:              spotKey,
                date:                  currentDateFormatted,
                shooting_host_user_id: trainingHostId,
                tries,
                makes,
            })
            
        } catch (error) {
            
            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }
    }

    getShootingSets = async (usersIdsArray, whereParams = {}) => {
        
        try {
            return await db('basketball_shooting_diary').select('*')
            .whereIn('shooter_id', usersIdsArray)
            .where(whereParams)
            .orderBy('created_at')

        } catch (error) {

            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }   
    }

    removeSetById = async (setsIds) => {

        try {
            return await db('basketball_shooting_diary')
            .whereIn('shooting_rep_id', setsIds)
            .del()

        } catch (error) {

            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }   
    }

    getShootingSetsDtosWithInfo = (shootingSets) => {
        
        const result = {}

        const involvedUsersIds = new Set();

        shootingSets.forEach((set) => {

            const setDto =  new TrainingSetDto(set);

            involvedUsersIds.add(setDto['shooterId'])
            involvedUsersIds.add(setDto['shootingHostUserId'])
                        
            result[setDto.shootingRepId] = setDto;
        })

        return {
            sets: result,
            involvedUsersIds: Array.from(involvedUsersIds),
        }
    }

}

module.exports = new ShootingDiaryService();
