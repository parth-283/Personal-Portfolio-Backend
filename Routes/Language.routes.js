const Language = require('../Controllers/LanguageController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, Language.getLanguage)
router.post('/', Authentication, Language.addLanguage)
router.patch('/:id', Authentication, Language.updateLanguage)
router.delete('/:id', Authentication, Language.deleteLanguage)

module.exports = router