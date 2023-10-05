const Language = require('../Controllers/LanguageController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Language.getLanguage)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Language.addLanguage)
router.patch('/:id', Authentication(["user", "admin"]), Language.updateLanguage)
router.delete('/:id', Authentication(["user", "admin"]), Language.deleteLanguage)

module.exports = router