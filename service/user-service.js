const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');
const UserSimpleStatsDto = require('../dtos/user-simple-stats-dto');


class UserServise {

    async registration(login, email, password) {
        
        let candidate = await UserModel.findOne({email});
        if(candidate) {
            throw ApiError.BadRequest('user with email:' + email + ' already exists');
        }

        candidate = await UserModel.findOne({login});
        if(candidate) {
            throw ApiError.BadRequest('user with login:' + login + ' already exists');
        }

        const hashPassword = await bcrypt.hash(password, 3);
        // const activationLink = uuid.v4()
        // const user = await UserModel.create({login, email, password: hashPassword, activationLink});
        // await mailService.sendActivationMail(email, process.env.API_URL + '/api/activate/' + activationLink);
        const user = await UserModel.create({login, email, password: hashPassword});


        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

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

    async getUsersById(ids) {

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
}

module.exports = new UserServise();