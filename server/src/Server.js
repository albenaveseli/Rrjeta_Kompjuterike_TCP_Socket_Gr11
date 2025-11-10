const net = require('net');
const TrafficMonitor = require('./TrafficMonitor');
const FileManager = require('./FileManager');
const ClientHandler = require('./ClientHandler');
const Helpers = require('./utils/helpers');

class Server {
  constructor(config) {
    this.config = config;
    this.server = null;
    this.trafficMonitor = new TrafficMonitor();
    this.fileManager = new FileManager(config.files.basePath);
    this.clients = new Map();
    this.monitorInterval = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (error) => {
        reject(error);
      });

      this.server.listen(this.config.server.port, this.config.server.host, () => {
        console.log(`Server running on ${this.config.server.host}:${this.config.server.port}`);
        this.startMonitoring();
        resolve();
      });

      this.server.maxConnections = this.config.server.maxConnections;
    });
  }

  handleConnection(socket) {
    if (this.clients.size >= this.config.server.maxConnections) {
      socket.end('Server is at maximum capacity. Please try again later.');
      return;
    }

    const clientHandler = new ClientHandler(
      socket, 
      this.trafficMonitor, 
      this.fileManager, 
      this.config
    );

    this.clients.set(clientHandler.clientId, clientHandler);

    socket.on('close', () => {
      this.clients.delete(clientHandler.clientId);
    });
  }

  startMonitoring() {
    this.monitorInterval = setInterval(async () => {
      await this.trafficMonitor.saveStatsToFile();
      
      // Log current stats to console every 30 seconds
      if (Date.now() % 30000 < 5000) {
        this.logCurrentStats();
      }
    }, this.config.server.monitorInterval);
  }

  logCurrentStats() {
    const stats = this.trafficMonitor.getStats();
    console.log('\n=== Server Statistics ===');
    console.log(`Active connections: ${stats.activeConnections}`);
    console.log(`Total connections: ${stats.totalConnections}`);
    console.log(`Total messages: ${stats.totalMessages}`);
    console.log(`Traffic - Received: ${Helpers.formatBytes(stats.traffic.received)}`);
    console.log(`Traffic - Sent: ${Helpers.formatBytes(stats.traffic.sent)}`);
    console.log(`Uptime: ${stats.uptime}`);
    console.log('========================\n');
  }

  async stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    // Close all client connections
    for (const clientHandler of this.clients.values()) {
      clientHandler.socket.destroy();
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Server;