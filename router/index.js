const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const userConnectionsController = require('../controllers/user-connections-controller');


const router = new Router();

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    body('login').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);


router.post('/searchUsers', authMiddleware, userController.searchUsers);
router.post('/getUserConnections', authMiddleware, userConnectionsController.getUserConnections);


module.exports = router;
