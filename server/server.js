const Server = require('./src/Server');
const config = require('./config/config.json');


// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const server = new Server(config);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await server.stop();
  process.exit(0);
});

// Start server
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});