const Reference = require('../Controllers/ReferencesController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Reference.getReference)

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Reference.addReference)
router.patch('/:id', Authentication(["user", "admin"]), Reference.updateReference)
router.delete('/:id', Authentication(["user", "admin"]), Reference.deleteReference)

module.exports = router