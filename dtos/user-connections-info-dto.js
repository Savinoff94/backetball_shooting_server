
module.exports = class UserConnectionsInfoDto {

    friends;
    pendingThisUsersFriendRequests;
    pendingOtherUsersFriendRequests;

    constructor(model) {

        if(!model) {

            model = {};

            model.friends = [];
            model.pendingThisUsersFriendRequests = [];
            model.pendingOtherUsersFriendRequests = [];
        }

        this.friends                         = [...model.friends];
        this.pendingThisUsersFriendRequests  = [...model.pendingThisUsersFriendRequests];
        this.pendingOtherUsersFriendRequests = [...model.pendingOtherUsersFriendRequests];
        
    }
}