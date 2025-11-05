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
  }}