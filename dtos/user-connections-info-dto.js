
module.exports = class UserConnectionsInfoDto {

    holderUserId;
    friends;
    pendingThisUsersFriendRequests;
    pendingOtherUsersFriendRequests;

    constructor(model) {

        if(!model) {

            model = {};

            model.friends = [];
            model.pendingThisUsersFriendRequests = [];
            model.pendingOtherUsersFriendRequests = [];
            model.holderUserId = '';
        }

        this.friends                         = model.friends;
        this.pendingThisUsersFriendRequests  = model.pendingThisUsersFriendRequests;
        this.pendingOtherUsersFriendRequests = model.pendingOtherUsersFriendRequests;
        this.holderUserId = model.holderUserId;
        
    }
}