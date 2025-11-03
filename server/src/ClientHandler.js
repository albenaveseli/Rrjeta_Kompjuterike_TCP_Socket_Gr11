const Helpers = require('./utils/helpers');

class ClientHandler {
  constructor(socket, trafficMonitor, fileManager, config) {
    this.socket = socket;
    this.trafficMonitor = trafficMonitor;
    this.fileManager = fileManager;
    this.config = config;
    
    this.clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    this.isAdmin = this.checkAdminPrivileges();
    this.isConnected = true;
    this.timeout = null;

    this.setupSocket();
    this.setupTimeout();
  }

  checkAdminPrivileges() {
    return this.config.admin.allowedIPs.includes(this.socket.remoteAddress);
  }

  setupSocket() {
    this.trafficMonitor.connectionEstablished(this.clientId, this.socket.remoteAddress);

    this.socket.on('data', (data) => {
      this.handleData(data);
    });

    this.socket.on('close', () => {
      this.handleClose();
    });

    this.socket.on('error', (error) => {
      this.handleError(error);
    });

    console.log(`Client connected: ${this.clientId} (${this.isAdmin ? 'Admin' : 'Read-only'})`);
  }

  setupTimeout() {
    this.resetTimeout();

    this.socket.on('data', () => {
      this.resetTimeout();
    });
  }

  resetTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      if (this.isConnected) {
        console.log(`Connection timeout for client: ${this.clientId}`);
        this.socket.end('Connection timeout');
      }
    }, this.config.server.connectionTimeout);
  }

  handleClose() {
    this.isConnected = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.trafficMonitor.connectionClosed(this.clientId);
    console.log(`Client disconnected: ${this.clientId}`);
  }

  handleError(error) {
    console.error(`Client error (${this.clientId}):`, error.message);
  }
}

module.exports = ClientHandler;
