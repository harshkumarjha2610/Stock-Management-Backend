const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.get('/sales', ctrl.getSalesReport);
router.get('/profit', ctrl.getProfitReport);
router.get('/gst', ctrl.getGSTReport);
router.get('/dashboard', ctrl.getDashboardStats);

module.exports = router;
