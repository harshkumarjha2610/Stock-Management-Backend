const router = require('express').Router();
const ctrl = require('../controllers/discount.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

// Category discount endpoints
router.post('/category', ctrl.applyCategoryDiscount);
router.get('/category', ctrl.getCategoryRules);

// Generic delete (works for any rule type by ID)
router.delete('/:id', ctrl.deleteDiscountRule);

module.exports = router;
