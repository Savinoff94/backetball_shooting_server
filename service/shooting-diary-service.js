const db = require('../modules/db').db;
const ApiError = require('../exeptions/api-error');


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

}

module.exports = new ShootingDiaryService();
