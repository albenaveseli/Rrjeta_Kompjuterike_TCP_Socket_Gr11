const AdminClient = require('./src/AdminClient');
const ReadOnlyClient = require('./src/ReadOnlyClient');
const config = require('./config/config.json');

// Get client type from command line or use config
const clientType = process.argv[2] || config.client.type;

let client;

if (clientType.toLowerCase() === 'admin') {
  client = new AdminClient(config);
  console.log('Starting Admin Client...');
} else {
  client = new ReadOnlyClient(config);
  console.log('Starting Read-Only Client...');
}

// Connect to server and start interactive mode
client.connect()
  .then(() => {
    client.startInteractive();
  })
  .catch(error => {
    console.error('Failed to connect to server:', error.message);
    console.log('Retrying connection...');

    // Auto-retry connection
    const retryInterval = setInterval(() => {
      client.connect()
        .then(() => {
          clearInterval(retryInterval);
          client.startInteractive();
        })
        .catch(() => {
          console.log('Retrying connection...');
        });
    }, config.server.reconnectDelay);
  });