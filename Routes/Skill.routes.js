const Skill = require('../Controllers/SkillController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, Skill.getSkill)
router.post('/', Authentication, Skill.addSkill)
router.patch('/:id', Authentication, Skill.updateSkill)
router.delete('/:id', Authentication, Skill.deleteSkill)
router.delete('/:id/:skill', Authentication, Skill.deleteOneSkill)

module.exports = router