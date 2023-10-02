const Education = require('../Controllers/EducationController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, Education.getEducation)
router.post('/', Authentication, Education.addEducation)
router.patch('/:id', Authentication, Education.updateEducation)
router.delete('/:id', Authentication, Education.deleteEducation)

module.exports = router