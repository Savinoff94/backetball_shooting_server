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

            userConnections[userConncetionType] = await userService.getUsersDtosById(currentTypeUserIds);
        }

        return userConnections;
    }

    removeUsersIdsFromConnectionsCategory(connectionsCategoryName, usersIds, userConncectionsDocument) {

        const connectionsCategoryIds = userConncectionsDocument.get(connectionsCategoryName);

        if(!connectionsCategoryIds) {

            throw ApiError.BadRequest('wrong user connection category:' + connectionsCategoryName);
        }

        const filteredIds = connectionsCategoryIds.filter((userId) => !usersIds.includes(userId));

        userConncectionsDocument[connectionsCategoryName] = filteredIds
    }

    

    addUserIdsToConnectionsCategory(connectionsCategoryName, usersIds, userConncectionsDocument) {

        const connectionsCategoryIds = userConncectionsDocument.get(connectionsCategoryName);

        if(!connectionsCategoryIds) {

            throw ApiError.BadRequest('wrong user connection category:' + connectionsCategoryName);
        }

        const mergedIdsSet = new Set([...connectionsCategoryIds, ...usersIds]);

        userConncectionsDocument[connectionsCategoryName] = Array.from(mergedIdsSet)
    }


    async friendRequest(userId, ids, saveParameters = {}) {

        const userConncectionsDocument = await this.getUserConnectionsDocumentByUserId(userId);

        this.addUserIdsToConnectionsCategory('pendingThisUsersFriendRequests', ids, userConncectionsDocument);

        await userConncectionsDocument.save(saveParameters)
    }
    async friendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session) {

        const friendRequestPromises = userIdsUnderSideEffect.map(async(userIdUnderSideEffect) => {

            const userConnectionsDocument = await this.getUserConnectionsDocumentByUserId(userIdUnderSideEffect);

            if(!userConnectionsDocument) {

                throw ApiError.BadRequest('wrong user id:' + userIdUnderSideEffect);
            }

            return this.onUserGetFriendRequest(userConnectionsDocument, [userIdCausedSideEffect], session);
        });

        await Promise.all(friendRequestPromises)
    }
    async onUserGetFriendRequest(userConncectionsDocument, usersIds, session) {

        this.addUserIdsToConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConncectionsDocument);

        await userConncectionsDocument.save({session})
    }

    //user cancells his own friend request
    async cancelFriendRequest(userId, usersIds, saveParameters = {}) {

        const userConncectionsDocument = await this.getUserConnectionsDocumentByUserId(userId);

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConncectionsDocument);

        await userConncectionsDocument.save(saveParameters)
    }
    async cancelFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session) {

        const cancelFriendRequestPromises = userIdsUnderSideEffect.map(async(userIdUnderSideEffect) => {

            const userConnectionsDocument = await this.getUserConnectionsDocumentByUserId(userIdUnderSideEffect);

            if(!userConnectionsDocument) {

                throw ApiError.BadRequest('wrong user id:' + userIdUnderSideEffect);
            }

            return this.onUserGetFriendRequestCancelled(userConnectionsDocument, [userIdCausedSideEffect], session);
        });

        await Promise.all(cancelFriendRequestPromises)
    }
    async onUserGetFriendRequestCancelled(userConnectionsDocument, usersIds, session) {

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConnectionsDocument);

        await userConnectionsDocument.save({session})
    }


    async approveFriendRequest(userId, usersIds, saveParameters = {}) {

        const userConncectionsDocument = await this.getUserConnectionsDocumentByUserId(userId);

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConncectionsDocument);
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConncectionsDocument);

        await userConncectionsDocument.save(saveParameters)
    }
    async approveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session) {

        const friendAprrovePromises = userIdsUnderSideEffect.map((async(userIdUnderSideEffect) => {

            const userConnectionsDocument = await this.getUserConnectionsDocumentByUserId(userIdUnderSideEffect, session);

            if(!userConnectionsDocument) {

                throw ApiError.BadRequest('wrong user id:' + userIdUnderSideEffect);
            }

            return this.onUserFriendRequestApproval(userConnectionsDocument, [userIdCausedSideEffect], session);
        }))

        await Promise.all(friendAprrovePromises);
    }
    async onUserFriendRequestApproval(userConnectionsDocument, usersIds, session) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsDocument, {session});
        this.addUserIdsToConnectionsCategory('friends', usersIds, userConnectionsDocument, {session});

        await userConnectionsDocument.save({session})
    }
    

    async disapproveFriendRequest(userId, usersIds, saveParameters = {}) {

        const userConncectionsDocument = await this.getUserConnectionsDocumentByUserId(userId);

        this.removeUsersIdsFromConnectionsCategory('pendingOtherUsersFriendRequests', usersIds, userConncectionsDocument, saveParameters);

        await userConncectionsDocument.save(saveParameters)
    }
    async disapproveFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session) {

        const disapproveFriendRequestPromises = userIdsUnderSideEffect.map(async(userIdUnderSideEffect) => {

            const userConnectionsDocument = await this.getUserConnectionsDocumentByUserId(userIdUnderSideEffect, session);

            if(!userConnectionsDocument) {

                throw ApiError.BadRequest('wrong user id:' + userIdUnderSideEffect);
            }

            return this.onUserDisapprovalFriendRequest(userConnectionsDocument, [userIdCausedSideEffect], session);
        })

        await Promise.all(disapproveFriendRequestPromises)
    }
    async onUserDisapprovalFriendRequest(userConnectionsDocument, usersIds, session) {

        this.removeUsersIdsFromConnectionsCategory('pendingThisUsersFriendRequests', usersIds, userConnectionsDocument);

        await userConnectionsDocument.save({session})
    }

    // remove already added friend
    async removeFriendRequest(userId, usersIds, saveParameters = {}) {

        const userConncectionsDocument = await this.getUserConnectionsDocumentByUserId(userId);

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConncectionsDocument);

        await userConncectionsDocument.save(saveParameters)
    }
    async removeFriendRequestSideEffect(userIdCausedSideEffect, userIdsUnderSideEffect, session) {

        const removeFriendRequestPromises = await userIdsUnderSideEffect.map(async(userIdUnderSideEffect) => {

            const userConnectionsDocument = await this.getUserConnectionsDocumentByUserId(userIdUnderSideEffect);

            if(!userConnectionsDocument) {

                throw ApiError.BadRequest('wrong user id:' + userIdUnderSideEffect);
            }
            
            return this.onUserRemoveFriendRequest(userConnectionsDocument, [userIdCausedSideEffect], session);
        });

        await Promise.all(removeFriendRequestPromises);
    }
    async onUserRemoveFriendRequest(userConnectionsDocument, usersIds, session) {

        this.removeUsersIdsFromConnectionsCategory('friends', usersIds, userConnectionsDocument);

        await userConnectionsDocument.save({session})
    }
}

module.exports = new UserConnectionsService();
