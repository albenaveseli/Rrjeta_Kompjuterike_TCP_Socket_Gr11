class Helpers {
  static formatFileList(files) {
    if (!files || files.length === 0) {
      return 'No files found.';
    }

    return files.map(file => {
      const type = file.type === 'directory' ? '[DIR]' : '[FILE]';
      const size = file.type === 'directory' ? '' : ` (${this.formatBytes(file.size)})`;
      return `${type} ${file.name}${size}`;
    }).join('\n');
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatFileInfo(info) {
    return `
File Information:
  Size: ${this.formatBytes(info.size)}
  Created: ${info.created}
  Modified: ${info.modified}
  Type: ${info.isDirectory ? 'Directory' : 'File'}
    `.trim();
  }

  static parseResponse(data) {
    try {
      return JSON.parse(data);
    } catch {
      return { type: 'RAW', data: data.toString() };
    }
  }

  static displayResponse(response) {
    switch (response.type) {
      case 'LIST_RESPONSE':
        console.log('\nDirectory listing:');
        console.log(this.formatFileList(response.data));
        break;
      case 'READ_RESPONSE':
        console.log('\nFile content:');
        console.log(response.data.content);
        break;
      case 'DOWNLOAD_RESPONSE':
        console.log('\nFile content (download):');
        console.log(response.data.content);
        break;
      case 'SEARCH_RESPONSE':
        console.log('\nSearch results:');
        console.log(this.formatFileList(response.data));
        break;
      case 'INFO_RESPONSE':
        console.log(this.formatFileInfo(response.data));
        break;
      case 'STATS_RESPONSE':
        this.displayStats(response.data);
        break;
      case 'ERROR':
        console.log(`\nError: ${response.data.message}`);
        break;
      case 'MESSAGE_RESPONSE':
        console.log(`\nMessage: ${response.data.message}`);
        break;
      default:
        console.log('\nResponse:', response);
    }
  }

  static displayStats(stats) {
    console.log('\n=== Server Statistics ===');
    console.log(`Active connections: ${stats.activeConnections}`);
    console.log(`Total connections: ${stats.totalConnections}`);
    console.log(`Total messages: ${stats.totalMessages}`);
    console.log(`Traffic received: ${this.formatBytes(stats.traffic.received)}`);
    console.log(`Traffic sent: ${this.formatBytes(stats.traffic.sent)}`);
    console.log(`Uptime: ${stats.uptime}`);
    
    if (stats.activeClients && stats.activeClients.length > 0) {
      console.log('\nActive clients:');
      stats.activeClients.forEach(client => {
        console.log(`  ${client.ip} - Messages: ${client.messages}`);
      });
    }
    console.log('========================\n');
  }
}

module.exports = Helpers;