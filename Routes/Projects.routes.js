const Projects = require('../Controllers/ProjectsController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, Projects.getProjects)
router.post('/', Authentication, Projects.addProjects)
router.get('/:id', Authentication, Projects.specificProjects)
router.patch('/:id', Authentication, Projects.updateProjects)
router.delete('/:id', Authentication, Projects.deleteProjects)
router.delete('/:id/technologie/:technologie', Authentication, Projects.deleteTechnologies)

module.exports = router