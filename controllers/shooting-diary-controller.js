const { getCurrentDateFormatted } = require("../helpers/dates");
const shootingDiaryService = require('../service/shooting-diary-service');
const userServise = require('../service/user-service')

class ShootingDiaryController {

    async saveShootingSet(req,res,next) {

        try {

            const userData = await req.user;

            const trainingHostId = userData.id;

            const currentDateFormatted = getCurrentDateFormatted()

            const {shooterId, spotKey, tries, makes} = req.body;

            await shootingDiaryService.saveShootingSet(shooterId, currentDateFormatted, spotKey, trainingHostId, tries, makes);

            return res.sendStatus(200);


        } catch (error) {

            next(error);
        }

    }

    async getCurrentUserShootingSets(req,res, next) {

        try {

            const userData = await req.user;
            const currentUserId = userData.id;

            const shootingSets = await shootingDiaryService.getShootingSets([currentUserId]);
            const {sets, involvedUsersIds} = shootingDiaryService.getShootingSetsDtosWithInfo(shootingSets);

            //detete, because i dont want to read this user once again
            delete involvedUsersIds[currentUserId];
            
            const usersLoginsMap = await userServise.getUsersLoginsById(involvedUsersIds);
            usersLoginsMap[currentUserId] = userData.login

            return res.status(200).json({sets: sets, userIdLoginMap:usersLoginsMap});

        } catch (error) {
            
            next(error);
        }
    }

    async removeSet(req,res,next) {

        try {
            
            const {setId} = req.body;

            await shootingDiaryService.removeSetById([setId]);

            res.sendStatus(200);


        } catch (error) {

            next(error);
        }
    }
}

module.exports = new ShootingDiaryController();
