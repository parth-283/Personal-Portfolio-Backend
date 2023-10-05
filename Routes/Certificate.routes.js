const Certificate = require('../Controllers/CertificationController');
const { Authentication } = require('../Middlewares/Authentication');

const router = require('express').Router();


/* Public router */

/* Protected router */
/* FOR ONLY ADMIN */
router.get('/', Authentication(["admin"]), Certificate.getCertificate);

/* FOR ADMIN AND USER */
router.post('/', Authentication(["user", "admin"]), Certificate.addCertificate);
router.patch('/:id', Authentication(["user", "admin"]), Certificate.updateCertificate);
router.delete('/:id', Authentication(["user", "admin"]), Certificate.deleteCertificate);

module.exports = router;