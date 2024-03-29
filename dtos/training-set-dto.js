module.exports = class TrainingSetDto {

    shootingRepId;
    shooterId;
    dateStr;
    spotKey;
    shootingHostUserId;
    tries;
    makes;
    createdAtStr;

    constructor(model) {

        this.shootingRepId = model.shooting_rep_id
        this.shooterId = model.shooter_id
        this.dateStr = model.training_date_formatted
        this.spotKey = model.spot_key
        this.shootingHostUserId = model.shooting_host_user_id
        this.tries = model.tries
        this.makes = model.makes
        this.createdAtStr = model.created_at
        
    }
}