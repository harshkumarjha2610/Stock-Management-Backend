const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const seedSuperAdmin = require('./seeders/superAdmin.seed');

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (alter: true adjusts tables without dropping)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');

    // Seed default Super Admin
    await seedSuperAdmin();

    // Start Express server
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port} in ${env.nodeEnv} mode`);
      console.log(`📋 Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
