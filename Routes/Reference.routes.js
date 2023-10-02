const Reference = require('../Controllers/ReferencesController')
const { Authentication } = require('../Middlewares/Authentication')

const router = require('express').Router()

router.get('/', Authentication, Reference.getReference)
router.post('/', Authentication, Reference.addReference)
router.patch('/:id', Authentication, Reference.updateReference)
router.delete('/:id', Authentication, Reference.deleteReference)

module.exports = router