const router = require('express').Router();
const ctrl = require('../controllers/staff.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStaffSchema } = require('../validations/staff.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(storeAccessGuard);

router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(createStaffSchema), ctrl.createStaff);
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.getStaff);
router.get('/attendance', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.getAllAttendance);
router.post('/attendance', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.markAttendance);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.getStaffById);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.updateStaff);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.deleteStaff);
router.post('/:id/check-in', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.checkIn);
router.post('/:id/check-out', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.checkOut);
router.get('/:id/attendance', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF), ctrl.getAttendance);

module.exports = router;
