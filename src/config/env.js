require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'stock_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@stockms.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  },
};
