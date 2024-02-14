const UserModel = require('../models/user-model');
const UserConnectionsModel = require('../models/user-connections-info-model');
const UserSimpleStatsModel = require('../models/user-simple-stats-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const UserReferencesDTO = require('../dtos/user-references-dto');
const ApiError = require('../exeptions/api-error');
const UserSimpleStatsDto = require('../dtos/user-simple-stats-dto');
const SimpleStatsModel = require('../models/user-simple-stats-model');
const { default: mongoose } = require('mongoose');


class UserServise {

    async registration(login, email, password) {
        
        let candidate = await UserModel.findOne({email});
        if(candidate) {
            throw ApiError.BadRequest('user with email:' + email + ' already exists', [{email:'user with email:' + email + ' already exists'}]);
        }

        candidate = await UserModel.findOne({login});
        if(candidate) {
            throw ApiError.BadRequest('user with login:' + login + ' already exists', [{login:'user with login:' + login + ' already exists'}]);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        // const activationLink = uuid.v4()
        // const user = await UserModel.create({login, email, password: hashPassword, activationLink});
        // await mailService.sendActivationMail(email, process.env.API_URL + '/api/activate/' + activationLink);
        const user = await UserModel.create({login, email, password: hashPassword});


        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        
        await this.createUserRelatedDocuments(user);

        return {...tokens, user:userDto}
    }

    async activate(activationLink) {

        const user= await UserModel.findOne({activationLink})

        if(!user) {
            throw ApiError.BadRequest('Bad link');
        }

        user.isActivated = true;
        await user.save()

    }

    async login(login, password) {
        const user = await UserModel.findOne({login})
        if(!user) {
            throw new ApiError.BadRequest('User with such login not found')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals) {
            throw ApiError.BadRequest('wrong password')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user:userDto}

    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            
            throw ApiError.UnauthorizedError()
        }
        const userData = await tokenService.validateRefreshToken(refreshToken)
       
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb) {

            throw ApiError.UnauthorizedError()
        }
       
        const user = await UserModel.findById(userData.id)
       
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async getAllUsers(){
        
        const users = await UserModel.find()

        const usersDtos = this.getUsersDtosMap(users);

        return usersDtos
    }

    async getUsersByLogin(login) {

        const regex = new RegExp(`^${login}`, 'i') 

        return await UserModel.find({login: {$regex: regex}});
    }

    async getUsersDtosByLogin(login) {

        const regex = new RegExp(`^${login}`, 'i') 

        const users = await UserModel.find({login: {$regex: regex}});

        const usersDtos = this.getUsersDtosMap(users);

        return usersDtos;
    }

    async getExactUser(login) {

        const user = await UserModel.findOne({login});

        if(!user) {

            throw new ApiError.BadRequest('User with such login not found')
        }

        const usersDtos = this.getUsersDtosMap([user]);
        
        return usersDtos;
    }

    fillUsersWithSimpleStats(users, simpleStats) {

        const usersIds = Object.keys(users);

        const result = {};

        usersIds.forEach((userId) => {

            const userSimpleStats = simpleStats[userId] ? simpleStats[userId] :  new UserSimpleStatsDto(null);

            const user = users[userId];

            result[userId] = {...user, simpleStats: userSimpleStats}

        });

        return result;
    }

    async getUsersDocumentsById(ids) {

        return await Promise.all(

            ids.map((id) => UserModel.findById(id))
        )
    }

    async getUsersDtosById(ids) {

        const users = await Promise.all(

            ids.map((id) => UserModel.findById(id))
        )

        const usersDtos = this.getUsersDtosMap(users);

        return usersDtos;
    }

    getUsersDtosMap(users) {

        const result = {};

        users.forEach((user) => {

            const userDto = new UserDto(user);

            result[userDto.id] = userDto;

        });

        return result;
    }

    async getUserReferencesDTO(userId) {

        const userModel = await UserModel.findById(userId);

        return new UserReferencesDTO(userModel);
    }

    
    async createUserRelatedDocuments(userDocument) {

        const session = await mongoose.startSession();

        session.startTransaction();

        try {

            if(!userDocument.userConnectionsId) {

                const userConnectionsInctance = new UserConnectionsModel({});

                await userConnectionsInctance.save({session});

                userDocument.userConnectionsId = userConnectionsInctance._id.valueOf()
            }

            if(!userDocument.userSimpleStatsId) {
                
                const userSimpleStatsInstance = new UserSimpleStatsModel({});

                await userSimpleStatsInstance.save({session});

                userDocument.userSimpleStatsId = userSimpleStatsInstance._id.valueOf()
            }

            await userDocument.save({session});

            await session.commitTransaction();

        } catch (error) {

            await session.abortTransaction();

            throw ApiError.SessionError(error);
        }
        finally {
            
            await session.endSession();
        }
    }

    getEveryUserDtoMap(usersDocuments) {

        const userDtosMap = {};
        const userReferencesDtosMap = {};
        
        usersDocuments.forEach((userDocument) => {

            const userDto = new UserDto(userDocument);

            const userReferencesDto = new UserReferencesDTO(userDocument);

            userDtosMap[userDto['id']] = userDto;
            userReferencesDtosMap[userDto['id']] = userReferencesDto;
        })

        return {userDtosMap, userReferencesDtosMap}
    }

    fillUserInfoFromDto(data, userId, userDtosMap = {}, userSimpleStatsDtosMap = {}) {

        if(userId in userDtosMap) {

            data[userId] = structuredClone(userDtosMap[userId])
        }
        
        if(userId in userSimpleStatsDtosMap) {

            data[userId]['simpleStats'] = structuredClone(userSimpleStatsDtosMap[userId])
        }
        
    }

    getUsersLoginsById = async(ids) => {

        const result = {}

        const usersDocuments = await this.getUsersDocumentsById(ids);

        usersDocuments.forEach((userDocument) => {

            const userId = userDocument._id.valueOf();

            const userLogin = userDocument.login;

            result[userId] = userLogin;
        })

        return result;
    }
}

module.exports = new UserServise();