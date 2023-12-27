module.exports = class UserReferencesDto {

    id;
    shootingDiaryId;
    userConnectionsId;
    userSimpleStatsId;
    
    constructor(model) {

        this.id = model._id.valueOf();

        if(model.shootingDiaryId) {

            this.shootingDiaryId = model.shootingDiaryId;
        }
        else {

            this.shootingDiaryId = '';
        }

        if(model.userConnectionsId) {

            this.userConnectionsId = model.userConnectionsId;
        }
        else {

            this.userConnectionsId = '';
        }

        if(model.userSimpleStatsId) {

            this.userSimpleStatsId = model.userSimpleStatsId;
        }
        else {

            this.userSimpleStatsId = '';
        }
    }
}