const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const userRelatedDocumentsMiddleware = require('../middlewares/user-related-documents-middleware');
const userConnectionsController = require('../controllers/user-connections-controller');
const shootingDiaryController = require('../controllers/shooting-diary-controller');


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

router.post('/getTrainingSquadList', authMiddleware, userConnectionsController.getTrainingSquadList);
router.post('/saveShootingSet', authMiddleware, shootingDiaryController.saveShootingSet);

router.post('/searchUsers', authMiddleware, userController.searchUsers);
router.post('/getUserConnections', authMiddleware, userRelatedDocumentsMiddleware, userConnectionsController.getUserConnections);

router.post('/friendRequest', authMiddleware, userConnectionsController.friendRequest);
router.post('/cancelFriendRequest', authMiddleware, userConnectionsController.cancelFriendRequest);
router.post('/approveFriendRequest', authMiddleware, userConnectionsController.approveFriendRequest);
router.post('/disapproveFriendRequest', authMiddleware, userConnectionsController.disapproveFriendRequest);
router.post('/removeFriendRequest', authMiddleware, userConnectionsController.removeFriendRequest);

router.post('/getChartsData', authMiddleware, shootingDiaryController.getChartData);



router.post('/getCurrentUserShootingSets', authMiddleware, shootingDiaryController.getCurrentUserShootingSets);
router.post('/removeSet', authMiddleware, shootingDiaryController.removeSet);




module.exports = router;
