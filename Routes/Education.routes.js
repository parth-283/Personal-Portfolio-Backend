const Education = require('../Controllers/EducationController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()


/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Education.getEducation)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Education.addEducation)
router.patch('/:id', Authentication(["user", "admin"]), Education.updateEducation)
router.delete('/:id', Authentication(["user", "admin"]), Education.deleteEducation)

module.exports = router