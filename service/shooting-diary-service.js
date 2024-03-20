const db = require('../modules/db').db;
const ApiError = require('../exeptions/api-error');
const TrainingSetDto = require('../dtos/training-set-dto');
const ShootingSpotsConstants = require ('../helpers/shooting-spots-constants');
const ChartDTOs = require('../dtos/chart-dtos');
const {fakeShootingDataSet, fakeShootingDataSet_2, fakeShootingDataSet_3} = require('../helpers/fakeShootingSets');



class ShootingDiaryService {

    dbName = 'basketball_shooting_diary';

    saveShootingSet = async (shooterId, trainingDateFormatted, spotKey, trainingHostId, tries, makes, trainingDateISO) => {

        try {

            await db(this.dbName).insert({
                shooter_id:            shooterId,
                spot_key:              spotKey,
                trainingDateFormatted: trainingDateFormatted,
                trainingDateISO:       trainingDateISO,
                shooting_host_user_id: trainingHostId,
                tries,
                makes,
            })
            
        } catch (error) {
            
            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }
    }

    getShootingSets = async (usersIdsArray, offset = 0, limit = 15, whereParams = {}) => {
        
        try {
            return await db(this.dbName).select('*')
            .whereIn('shooter_id', usersIdsArray)
            .where(whereParams)
            .orderBy('created_at')
            .offset(offset)
            .limit(limit)

        } catch (error) {

            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }   
    }

    countShootingSets = async ( whereParams = {}) => {

        try {
            return await db(this.dbName).count('shooting_rep_id as count').where(whereParams);
        } catch (error) {
            throw ApiError.BadRequest('problems with POSTGRES: ' + error)
        }
    }

    async getChartData(usersIds, spotKeysArray, timeRange, chartKey) {
        
        switch (chartKey) {
            case 'shotsDispersionByCategory':
                {
                const data =  await db(this.dbName).select('shooter_id', 'spot_key', db.raw('SUM(tries)'))
                .whereIn('shooter_id', usersIds)
                .whereIn('spot_key', spotKeysArray)
                .groupBy('spot_key', 'shooter_id')
                .whereBetween('trainingDateISO', timeRange)

                return ChartDTOs.toShotsDispersionDTO(data, true)
                }
            case 'shotsDispersionBySpot':

                {
                const data =  await db(this.dbName).select('shooter_id', 'spot_key', db.raw('SUM(tries)'))
                .whereIn('shooter_id', usersIds)
                .whereIn('spot_key', spotKeysArray)
                .groupBy('spot_key', 'shooter_id')
                .whereBetween('trainingDateISO', timeRange)
                
                return ChartDTOs.toShotsDispersionDTO(data, false);
                }
                
            case 'shotsPersentageChart':

                {
                const data = await db(this.dbName).select('shooter_id', db.raw('DATE_TRUNC(\'day\', "trainingDateISO") as truncated_date'), db.raw('SUM(tries) as sum_tries'), db.raw('SUM(makes) as sum_makes'))
                .whereIn('shooter_id', usersIds)
                .whereIn('spot_key', spotKeysArray)
                .whereBetween('trainingDateISO', timeRange)
                .groupBy( 'shooter_id', db.raw('DATE_TRUNC(\'day\', "trainingDateISO")'))
                .orderBy('truncated_date')

                return ChartDTOs.toShotsNotGroupedBySpotDTO(data)
                }

            case 'shotsAmountChart':
                {
                const data = await db(this.dbName).select('shooter_id', db.raw('DATE_TRUNC(\'day\', "trainingDateISO") as truncated_date'), db.raw('SUM(tries) as sum_tries'), db.raw('SUM(makes) as sum_makes'))
                .whereIn('shooter_id', usersIds)
                .whereIn('spot_key', spotKeysArray)
                .whereBetween('trainingDateISO', timeRange)
                .groupBy( 'shooter_id', db.raw('DATE_TRUNC(\'day\', "trainingDateISO")'))
                .orderBy('truncated_date')

                return ChartDTOs.toShotsNotGroupedBySpotDTO(data)
                }
               
            case 'shotsAmountAndPercentageChart':
                {
                const data = await db(this.dbName).select('shooter_id', db.raw('DATE_TRUNC(\'day\', "trainingDateISO") as truncated_date'), 'spot_key', db.raw('SUM(tries) as sum_tries'), db.raw('SUM(makes) as sum_makes'))
                .whereIn('shooter_id', usersIds)
                .whereIn('spot_key', spotKeysArray)
                .whereBetween('trainingDateISO', timeRange)
                .groupBy('shooter_id', 'spot_key', db.raw('DATE_TRUNC(\'day\', "trainingDateISO")'))
                .orderBy('truncated_date')
                
                return ChartDTOs.toShotsGroupedBySpotDTO(data)
                }
        
            default:
                throw new Error('wrong chartKey')
                break;
        }
    }

    getUserTriesAndMakesAmountBySpots = async (shooterId, spotKeysArray) => {

        const data = await db(this.dbName).select('shooter_id', db.raw('SUM(tries) as sum_tries'), db.raw('SUM(makes) as sum_makes'))
        .where({'shooter_id': shooterId})
        .whereIn('spot_key', spotKeysArray)
        .groupBy('shooter_id');
        
        return data[0];
    }

    removeSetById = async (setsIds) => {

        try {
            return await db(this.dbName)
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

    getShootingSpotsArrayToFilter = (shootingSpot) => {

        const shootingSpotsTypes = ShootingSpotsConstants.getShootingSpotsTypes(); 

        if(shootingSpot === 'all') {

            return [].concat(...Object.values(shootingSpotsTypes));
        }

        if(shootingSpot in shootingSpotsTypes) {

            return shootingSpotsTypes[shootingSpot]
        }

        return [shootingSpot];
    }


    saveShootingFakeData = async (userId) => {

        const promises = fakeShootingDataSet_3.map((data) => {

            const {tries, makes, spotKey, trainingDateFormatted, trainingDateISO} = data

            return this.saveShootingSet(userId, trainingDateFormatted, spotKey, userId, tries, makes, trainingDateISO);
        })

        await Promise.all(promises);
    } 

}

module.exports = new ShootingDiaryService();
