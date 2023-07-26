//data transfer object
module.exports = class UserDto {

    id;
    userName;
    email;
    // isActivated;

    constructor(model) {

        this.id = model._id
        this.userName = model.userName
        this.email = model.email
        // this.isActivated = model.isActivated
    }
}