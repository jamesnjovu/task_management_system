// Load environment variables
require('dotenv').config();

const app = require('./app');
const { logger } = require('./utils/logger');
const config = require('./config/config');

// Start the server
const PORT = config.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});
