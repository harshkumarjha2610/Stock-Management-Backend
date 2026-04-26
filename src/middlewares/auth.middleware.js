const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

/**
 * Verifies JWT token from Authorization header and attaches user payload to req.user.
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a valid token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded; // { id, store_id, role }
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

/**
 * Factory function that returns middleware restricting access to specified roles.
 * Usage: authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

/**
 * Ensures non-super-admin users can only access data within their own store.
 * Attaches the effective store_id to req.storeId for use in services.
 */
const storeAccessGuard = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    // Super Admin can access any store — use store_id from params/body/query
    req.storeId = req.params.storeId || req.body.store_id || req.query.store_id || req.user.store_id;
  } else {
    // Admin/Staff can only access their own store
    req.storeId = req.user.store_id;
  }

  if (!req.storeId) {
    return next(new AppError('Store context is required.', 400));
  }

  next();
};

module.exports = { authenticateUser, authorizeRoles, storeAccessGuard };
