const ShootingDiaryService = require('../service/shooting-diary-service');
const ShootingSpotsConstants = require('../helpers/shooting-spots-constants');
const UserStatsService = require('../service/user-stats-service');
const UserService = require('../service/user-service')

class SimpleStatsController {

    updateUsersSimpleStats = async (req,res,next) => {

        try {
            
            const {shooterId, spotKey} = req.body;

            const sameCategorySpotsArray = ShootingDiaryService.getShootingSpotsArrayToFilter(spotKey);
            const spotCategory = ShootingSpotsConstants.translateSpotCategoryToSimpleStatCategory(ShootingSpotsConstants.getSpotCategory(spotKey));
            
            const usersCategoryShootingData = await ShootingDiaryService.getUserTriesAndMakesAmountBySpots(shooterId, sameCategorySpotsArray);
            const percent = Math.round((usersCategoryShootingData.sum_makes * 100) / usersCategoryShootingData.sum_tries);

            const userReferencesDto = await UserService.getUserReferencesDTO(shooterId);
            const simpleStatsDocument = await UserStatsService.getUserSimpleStatsDocument(userReferencesDto)
            simpleStatsDocument[spotCategory] = percent;
            await simpleStatsDocument.save();

            return res.sendStatus(200);
            
        } catch (error) {
            
            next(error);
        }

    }
}

module.exports = new SimpleStatsController()