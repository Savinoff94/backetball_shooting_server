//data transfer object
module.exports = class UserDto {

    id;
    login;
    email;
    // isActivated;
    // simpleStats
    constructor(model) {

        this.id = model._id
        this.login = model.login
        this.email = model.email
        // this.isActivated = model.isActivated
    }

    // setSimpleStats(simpleStats) {

    //     this.simpleStats = new UserSimpleStatsDto(simpleStats)
    // }
}