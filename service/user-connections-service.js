const UserConnectionsInfoModel = require('../models/user-connections-info-model');
const UserModel = require('../models/user-model');
const UserConnectionsInfoDto = require('../dtos/user-connections-info-dto')
const ApiError = require('../exeptions/api-error');
const userService = require('./user-service');
const UserReferencesDto = require('../dtos/user-references-dto');
const { default: mongoose } = require('mongoose');



class UserConnectionsService {

    async getUserConnectionsDocumentByUserId(userId) {

        const userDocument = await UserModel.findById(userId);

        if(!userDocument) {

            throw ApiError.BadRequest('wrong user id:' + userId);
        }

        const userConnectionsId = userDocument.userConnectionsId;

        if(!userConnectionsId) {

            return await this.createUserConnectionsInOwnSession(userDocument);
        }
        
        return await UserConnectionsInfoModel.findById(userConnectionsId);
    }

    async createUserConnectionsInOwnSession(userDocument, userConncectionsData = {}) {

        const session = await mongoose.startSession();

        session.startTransaction();

        try {

            const userConnectionsDocument = await this.createUserConnections(userDocument, session, userConncectionsData)

            await session.commitTransaction();

            return userConnectionsDocument;
        
        } catch (error) {

            await session.abortTransaction();

            throw ApiError.SessionError(error);
        
        } finally {
            
            session.endSession();
        }
    }

    async createUserConnections(userDocument, session, userConncectionsData = {}) {

        const userConnectionsModelInstance = new UserConnectionsInfoModel(userConncectionsData);
        
        const userConnectionsDocument = await userConnectionsModelInstance.save({ session });

        if(!userConnectionsDocument) {

            throw ApiError.SessionError('cant save user connectionsModel');
        }

        userDocument.userConnectionsId = userConnectionsDocument._id.valueOf();

        const updatedUserDocument = await userDocument.save({session});

        if(!updatedUserDocument) {

            throw ApiError.SessionError('cant update userModel');
        }

        return userConnectionsDocument;
    }

    async getUserConnectionsDtoByUserId(userId) {

        const userConncectionsInfo = await this.getUserConnectionsDocumentByUserId(userId);

        const userConnectionsInfoDto = new UserConnectionsInfoDto(userConncectionsInfo);

        return userConnectionsInfoDto;
    }

    async getUserConnectionsFilledWithUsersDtos(userConncetionsInfo) {

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


    async friendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.addUserIdsToConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    async friendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session = null) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserGetFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect, session);
        }

    }
    async onUserGetFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.addUserIdsToConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }

    //user cancells his own friend request
    async cancelFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    async cancelFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session = null) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserGetFriendRequestCancelled(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect, session);
        }

    }
    async onUserGetFriendRequestCancelled(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }


    async approveFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    async approveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session = null) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserFriendRequestApproval(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect, session);
        }
    }
    async onUserFriendRequestApproval(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    

    async disapproveFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    async disapproveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session = null) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserDisapprovalFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect, session);
        }
    }
    async onUserDisapprovalFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }

    // remove already added friend
    async removeFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }
    async removeFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session = null) {

        for(const userIdUnderSideEffect of userIdsUnderSideEffect) {

            const userConnectionsInfo = await this.getUserConnectionsInfoByUserId(userIdUnderSideEffect);

            await this.onUserRemoveFriendRequest(userConnectionsInfo, [userIdCausedSideEffect], userIdUnderSideEffect, session);
        }
    }
    async onUserRemoveFriendRequest(userConnectionsInfo, usersIds, holderUserId, session = null) {

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConnectionsInfo);

        await this.saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session);
    }


    async saveUserConnectionsInfo(userConnectionsInfo, holderUserId, session = null) {

        if(session) {

            if(!userConnectionsInfo['holderUserId']) {

                await UserConnectionsInfoModel.create([{...userConnectionsInfo,holderUserId: holderUserId}], {session});
    
                return;
            }
    
            await UserConnectionsInfoModel.findOneAndUpdate({holderUserId: holderUserId}, {...userConnectionsInfo}).session(session);

        }
        else {

            if(!userConnectionsInfo['holderUserId']) {

                await UserConnectionsInfoModel.create([{...userConnectionsInfo,holderUserId: holderUserId}]);
    
                return;
            }
    
            await UserConnectionsInfoModel.findOneAndUpdate({holderUserId: holderUserId}, {...userConnectionsInfo});
        }
    }
}

module.exports = new UserConnectionsService();
