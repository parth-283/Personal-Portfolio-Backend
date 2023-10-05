const Projects = require('../Controllers/ProjectsController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Projects.getProjects)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Projects.addProjects)
router.get('/:id', Authentication(["user", "admin"]), Projects.specificProjects)
router.patch('/:id', Authentication(["user", "admin"]), Projects.updateProjects)
router.delete('/:id', Authentication(["user", "admin"]), Projects.deleteProjects)
router.delete('/:id/technologies/:technology', Authentication(["user", "admin"]), Projects.deleteTechnologies)

module.exports = router