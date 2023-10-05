const Skill = require('../Controllers/SkillController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Skill.getSkill)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Skill.addSkill)
router.patch('/:id', Authentication(["user", "admin"]), Skill.updateSkill)
router.delete('/:id', Authentication(["user", "admin"]), Skill.deleteSkill)
router.delete('/:id/:skill', Authentication(["user", "admin"]), Skill.deleteOneSkill)

module.exports = router