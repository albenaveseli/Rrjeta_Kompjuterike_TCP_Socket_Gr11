const fs = require('fs').promises;
const path = require('path');

class TrafficMonitor {
  constructor() {
    this.stats = {
      activeConnections: 0,
      totalConnections: 0,
      totalMessages: 0,
      traffic: {
        received: 0,
        sent: 0
      },
      clients: new Map(),
      startTime: new Date()
    };
  }

  connectionEstablished(clientId, clientIP) {
    this.stats.activeConnections++;
    this.stats.totalConnections++;
    
    this.stats.clients.set(clientId, {
      ip: clientIP,
      messagesReceived: 0,
      bytesReceived: 0,
      bytesSent: 0,
      connectedAt: new Date(),
      lastActivity: new Date()
    });
  }

  connectionClosed(clientId) {
    if (this.stats.clients.has(clientId)) {
      this.stats.activeConnections--;
    }
  }

  messageReceived(clientId, messageSize) {
    const client = this.stats.clients.get(clientId);
    if (client) {
      client.messagesReceived++;
      client.bytesReceived += messageSize;
      client.lastActivity = new Date();
    }
    this.stats.totalMessages++;
    this.stats.traffic.received += messageSize;
  }

  messageSent(clientId, messageSize) {
    const client = this.stats.clients.get(clientId);
    if (client) {
      client.bytesSent += messageSize;
    }
    this.stats.traffic.sent += messageSize;
  }

  getStats() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    const activeClients = Array.from(this.stats.clients.entries())
      .filter(([_, client]) => this.stats.clients.has(_))
      .map(([id, client]) => ({
        id,
        ip: client.ip,
        messages: client.messagesReceived,
        bytesReceived: client.bytesReceived,
        bytesSent: client.bytesSent,
        connectedSince: client.connectedAt
      }));

    return {
      ...this.stats,
      activeClients,
      uptime: this.formatUptime(uptime)
    };
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  }

  async saveStatsToFile() {
    const stats = this.getStats();
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...stats
    };

    try {
      const logPath = path.join(__dirname, '../logs/server_stats.txt');
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Error saving stats to file:', error);
    }
  }
}

module.exports = TrafficMonitor;