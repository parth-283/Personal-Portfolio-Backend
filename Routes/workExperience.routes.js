const WorkExperience = require('../Controllers/workExperienceController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()


/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), WorkExperience.getWorkExperience)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), WorkExperience.addWorkExperience)
router.patch('/:id', Authentication(["user", "admin"]), WorkExperience.updateWorkExperience)
router.delete('/:id', Authentication(["user", "admin"]), WorkExperience.deleteWorkExperience)

module.exports = router