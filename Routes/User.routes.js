const router = require('express').Router();
const UserController = require('../Controllers/UserController');
const { Authentication, } = require('../Middlewares/Authentication');
const { bcryptPassword } = require('../Middlewares/bcryptPassword');

/* Public router */
router.post('/register', bcryptPassword, UserController.Register)
router.get('/login', UserController.Login)

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/getUser', Authentication(["admin", "visitor"]), UserController.GetUserWithAllData)

/* FOR ADMIN AND USER */
router.post('/forgetPassword', Authentication(["admin", "user"]), UserController.ForgetPassword)
router.post('/shareResume/:email', Authentication(["admin", "user"]), UserController.shareResume)
router.patch('/:id', Authentication(["admin", "user"]), UserController.updateUser)
router.get('/logout', Authentication(["admin", "user"]), UserController.LogOut)
router.get('/:id', Authentication(["admin", "user"]), UserController.specificUser)
router.get('/previewResume/:email', Authentication(["admin", "user"]), UserController.previewResume)
router.get('/resetPassword', [Authentication(["admin", "user"]), bcryptPassword], UserController.ResetPassword)

module.exports = router