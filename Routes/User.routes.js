const router = require('express').Router();
const UserController = require('../Controllers/UserController');
const { Authentication } = require('../Middlewares/Authentication');
const { bcryptPassword } = require('../Middlewares/bcryptPassword');

router.post('/register', bcryptPassword, UserController.Register)
router.get('/login', UserController.Login)
router.get('/logout', Authentication, UserController.LogOut)
router.patch('/:id', Authentication, UserController.updateUser)
router.get('/getuserwithalldata', Authentication, UserController.GetUserWithAllData)
router.get('/:id', Authentication, UserController.specificUser)
router.post('/forgetPassword', Authentication, UserController.ForgetPassword)
router.get('/resetPassword', bcryptPassword, UserController.ResetPassword)
router.post('/shareResume/:email', Authentication, UserController.shareResume)
router.get('/previewResume/:email', Authentication, UserController.previewResume)

module.exports = router