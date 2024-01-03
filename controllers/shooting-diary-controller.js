const { getCurrentDateFormatted } = require("../helpers/dates");
const shootingDiaryService = require('../service/shooting-diary-service');

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
}

module.exports = new ShootingDiaryController();
