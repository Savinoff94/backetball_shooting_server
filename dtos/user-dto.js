//data transfer object
module.exports = class UserDto {

    id;
    login;
    email;
    // isActivated;

    constructor(model) {

        this.id = model._id
        this.login = model.login
        this.email = model.email
        // this.isActivated = model.isActivated
    }
}