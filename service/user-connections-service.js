const UserConnectionsInfoModel = require('../models/user-connections-info-model');
const UserConnectionsInfoDto = require('../dtos/user-connections-info-dto')
const ApiError = require('../exeptions/api-error');
const userService = require('./user-service');


class UserConnectionsService {

    async getUserConnectionsInfoByUserId(userId) {

        const userConncectionsInfo = await UserConnectionsInfoModel.findOne({holderUserId: userId});

        const userConnectionsInfoDto = new UserConnectionsInfoDto(userConncectionsInfo);

        return userConnectionsInfoDto;
    }

    async getUserConnections(userConncetionsInfo) {

        const userConnections = {};

        const userConnectionsTypes = Object.keys(userConncetionsInfo);

        for(const userConncetionType of userConnectionsTypes) {

            if(userConncetionType === 'holderUserId') {

                continue;
            }

            const currentTypeUserIds = userConncetionsInfo[userConncetionType];

            userConnections[userConncetionType] = await userService.getUsersById(currentTypeUserIds);
        }

        return userConnections;
    }

    removeUsersIdsFromConnectionsCategory(connectionsCategoryName, usersIds, userConncectionsInfo) {

        if(!(connectionsCategoryName in userConncectionsInfo)) {

            throw ApiError.BadRequest('wrong user connection category:' + connectionsCategoryName);
        }

        const filteredIds = userConncectionsInfo[connectionsCategoryName].filter((userId) => !usersIds.includes(userId));

        userConncectionsInfo[connectionsCategoryName] = filteredIds;
    }

    addUserIdsToConnectionsCategory(connectionsCategoryName, usersIds, userConncectionsInfo) {

        if(!(connectionsCategoryName in userConncectionsInfo)) {

            throw ApiError.BadRequest('wrong user connection category:' + connectionsCategoryName);
        }

        const connectionsCategoryIds = userConncectionsInfo[connectionsCategoryName];

        const mergedIdsSet = new Set([...connectionsCategoryIds, ...usersIds]);

        userConncectionsInfo[connectionsCategoryName] = Array.from(mergedIdsSet);
    }


    async friendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.addUserIdsToConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    async friendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserGetFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect);
        }

    }
    async onUserGetFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.addUserIdsToConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }

    //user cancells his own friend request
    async cancelFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    async cancelFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserGetFriendRequestCancelled(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect);
        }

    }
    async onUserGetFriendRequestCancelled(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }


    async approveFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    async approveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserFriendRequestApproval(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect);
        }
    }
    async onUserFriendRequestApproval(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    

    async disapproveFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    async disapproveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserDisapprovalFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect);
        }
    }
    async onUserDisapprovalFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }

    // remove already added friend
    async removeFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }
    async removeFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserRemoveFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect);
        }
    }
    async onUserRemoveFriendRequest(userConnectionsInfo, usersIds, holderUserId) {

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId);
    }


    async saveUserConnectionsInfo(userConnectionsInfo, holderUserId) {

        if(!userConnectionsInfo['holderUserId']) {

            await UserConnectionsInfoModel.create({...userConnectionsInfo,holderUserId: holderUserId});

            return;
        }

        await UserConnectionsInfoModel.findOneAndUpdate({holderUserId: holderUserId}, {...userConnectionsInfo});
    }
    
    
}

module.exports = new UserConnectionsService();
