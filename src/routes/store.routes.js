const router = require('express').Router();
const { createStore, getAllStores, getStoreById } = require('../controllers/store.controller');
const { authenticateUser, authorizeRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStoreSchema } = require('../validations/store.validation');
const ROLES = require('../constants/roles');

// All store routes require Super Admin
router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.post('/', validate(createStoreSchema), createStore);
router.get('/', getAllStores);
router.get('/:id', getStoreById);

module.exports = router;
