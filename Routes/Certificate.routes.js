const Certificate = require('../Controllers/CertificationController');
const { Authentication } = require('../Middlewares/Authentication');

const router = require('express').Router();

router.get('/', Authentication, Certificate.getCertificate);
router.post('/', Authentication, Certificate.addCertificate);
router.patch('/:id', Authentication, Certificate.updateCertificate);
router.delete('/:id', Authentication, Certificate.deleteCertificate);

module.exports = router;