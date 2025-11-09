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

  async handleData(data) {
    try {
      const message = data.toString().trim();
      this.trafficMonitor.messageReceived(this.clientId, data.length);

      console.log(`Received from ${this.clientId}: ${message}`);

      if (message === 'STATS') {
        await this.handleStats();
      } else if (message.startsWith('/')) {
        await this.handleCommand(message);
      } else {
        await this.handleMessage(message);
      }
    } catch (error) {
      this.sendError(error.message);
    }
  }

  async handleStats() {
    const stats = this.trafficMonitor.getStats();
    this.sendResponse('STATS_RESPONSE', stats);
  }

  async handleCommand(command) {
    if (!this.isAdmin && !command.startsWith('/list') && !command.startsWith('/read') && !command.startsWith('/search') && !command.startsWith('/info')) {
      this.sendError('Insufficient permissions');
      return;
    }

    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case '/list':
          await this.handleList(args);
          break;
        case '/read':
          await this.handleRead(args);
          break;
        case '/upload':
          await this.handleUpload(args, command);
          break;
        case '/download':
          await this.handleDownload(args);
          break;
        case '/delete':
          await this.handleDelete(args);
          break;
        case '/search':
          await this.handleSearch(args);
          break;
        case '/info':
          await this.handleInfo(args);
          break;
        default:
          this.sendError('Unknown command');
      }
    } catch (error) {
      this.sendError(error.message);
    }
  }

  async handleList(args) {
    const path = args[0] || '';
    const items = await this.fileManager.listDirectory(path);
    this.sendResponse('LIST_RESPONSE', items);
  }

  async handleRead(args) {
    if (args.length === 0) {
      throw new Error('Filename required');
    }
    const result = await this.fileManager.readFile(args[0]);
    this.sendResponse('READ_RESPONSE', result);
  }

  async handleUpload(args, fullCommand) {
    if (args.length === 0) {
      throw new Error('Filename and content required');
    }
    
    // Extract content after filename
    const contentStart = fullCommand.indexOf(args[0]) + args[0].length + 1;
    const content = fullCommand.substring(contentStart);
    
    const result = await this.fileManager.writeFile(args[0], content);
    this.sendResponse('UPLOAD_RESPONSE', result);
  }

  async handleDownload(args) {
    if (args.length === 0) {
      throw new Error('Filename required');
    }
    const result = await this.fileManager.readFile(args[0]);
    this.sendResponse('DOWNLOAD_RESPONSE', result);
  }

  async handleDelete(args) {
    if (args.length === 0) {
      throw new Error('Filename required');
    }
    const result = await this.fileManager.deleteFile(args[0]);
    this.sendResponse('DELETE_RESPONSE', result);
  }

  async handleSearch(args) {
    if (args.length === 0) {
      throw new Error('Keyword required');
    }
    const results = await this.fileManager.searchFiles(args[0]);
    this.sendResponse('SEARCH_RESPONSE', results);
  }

  async handleInfo(args) {
    if (args.length === 0) {
      throw new Error('Filename required');
    }
    const info = await this.fileManager.getFileInfo(args[0]);
    this.sendResponse('INFO_RESPONSE', info);
  }

  async handleMessage(message) {
    // Store message for monitoring (could save to database in real implementation)
    const response = {
      timestamp: new Date().toISOString(),
      message: `Echo: ${message}`,
      client: this.clientId
    };
    
    this.sendResponse('MESSAGE_RESPONSE', response);
  }

  sendResponse(type, data) {
    const response = {
      type,
      data,
      timestamp: new Date().toISOString(),
      isAdmin: this.isAdmin
    };

    const responseStr = JSON.stringify(response);
    this.socket.write(responseStr + '\n');
    this.trafficMonitor.messageSent(this.clientId, Buffer.byteLength(responseStr));
  }

  sendError(message) {
    this.sendResponse('ERROR', { message });
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