const WorkExperience = require('../Controllers/workExperienceController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, WorkExperience.getworkExperience)
router.post('/', Authentication, WorkExperience.addworkExperience)
router.patch('/:id', Authentication, WorkExperience.updateWorkExperience)
router.delete('/:id', Authentication, WorkExperience.deleteworkExperience)

module.exports = router