const ApiError = require('../exeptions/api-error');
const userServise = require('../service/user-service');
const userStatsService = require('../service/user-stats-service');
const {validationResult} = require('express-validator');

class UserController {

    async registration(req,res,next) {

        try {

            const errors = validationResult(req);

            if(!errors.isEmpty()) {

                return next(ApiError.BadRequest('validation error', errors.array()));
            }

            
            const {login, email, password} = req.body;
            const userData = await userServise.registration(login, email, password);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
            return res.json(userData)
            
        } catch (error) {
            
            next(error);
        }
    }
    async login(req,res,next) {

        try {
            const {login, password} = req.body;
            const userData = await userServise.login(login, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
            return res.json(userData)
        } catch (error) {
            next(error);
        }
    }
    async logout(req,res,next) {

        try {
            const {refreshToken} = req.cookies
            const token = await userServise.logout(refreshToken);
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (error) {
            next(error);
        }
    }
    async activate(req,res,next) {

        try {
            const activationLink = req.params.link;
            await userServise.activate(activationLink);
            return req.redirect(process.env.CLIENT_URL)

        } catch (error) {
            next(error);
        }
    }
    async refresh(req,res,next) {

        try {
            const {refreshToken} = req.cookies
            const userData = await userServise.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
            return res.json(userData)
        } catch (error) {
            next(error);
        }
    }

    async searchUsers(req,res,next) {

        try {

            const {login} = req.body;

            const users = await userServise.getUsersByLogin(login);

            const usersWithSimpleStats = await userStatsService.fillSimpleStatsInUsers(users);

            return res.json(usersWithSimpleStats);

        } catch (error) {
            
            next(error);
        }
    }
}

module.exports = new UserController();