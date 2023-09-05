const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');


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
        return users
    }
}

module.exports = new UserServise();