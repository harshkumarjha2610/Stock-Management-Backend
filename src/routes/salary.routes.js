const router = require('express').Router();
const ctrl = require('../controllers/salary.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createSalaryPaymentSchema } = require('../validations/salary.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.post('/', validate(createSalaryPaymentSchema), ctrl.createSalaryPayment);
router.get('/staff/:staffId', ctrl.getSalaryHistory);

module.exports = router;
