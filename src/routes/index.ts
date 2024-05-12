import {Router} from 'express';
import * as usersController from '../controllers/users.controller';
import authenticateMiddleware from '../middleware/authenticateUser';

const router = Router();

router.route('/').post(usersController.registerUsers);

router.route('/login').post(usersController.attemptLogin);

router.post('/verify-otp', usersController.verifyOtpCode);

router.get('/refresh-token', usersController.refreshToken);

// User must be loggedIn before can perform actions below
router.use(authenticateMiddleware);

// Update user details or delete account
router
  .route('/')
  .get(usersController.getUserDetails)
  .put(usersController.updateAccountInfo)
  .delete(usersController.deleteAccount);

router.post('/deactivate-account', usersController.deactivateAccount);
router.post('/reactivate-account', usersController.reactivateAccount);

export default router;
