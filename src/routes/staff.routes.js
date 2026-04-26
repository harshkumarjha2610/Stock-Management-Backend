const router = require('express').Router();
const ctrl = require('../controllers/staff.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStaffSchema } = require('../validations/staff.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.post('/', validate(createStaffSchema), ctrl.createStaff);
router.get('/', ctrl.getStaff);
router.get('/:id', ctrl.getStaffById);
router.post('/:id/check-in', ctrl.checkIn);
router.post('/:id/check-out', ctrl.checkOut);
router.get('/:id/attendance', ctrl.getAttendance);

module.exports = router;
