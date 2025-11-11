const net = require('net');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const Helpers = require('./utils/helpers');

class Client {
  constructor(config) {
    this.config = config;
    this.socket = null;
    this.rl = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({
        host: this.config.server.host,
        port: this.config.server.port
      }, () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`Connected to server at ${this.config.server.host}:${this.config.server.port}`);
        resolve();
      });

      this.socket.on('data', (data) => {
        this.handleData(data);
      });

      this.socket.on('close', () => {
        this.handleClose();
      });

      this.socket.on('error', (error) => {
        this.handleError(error);
        reject(error);
      });

      this.socket.setTimeout(this.config.server.timeout);
      this.socket.on('timeout', () => {
        console.log('Connection timeout');
        this.socket.end();
      });
    });
  }

  handleData(data) {
    const responses = data.toString().split('\n').filter(line => line.trim());
    
    responses.forEach(response => {
      try {
        const parsed = Helpers.parseResponse(response);
        Helpers.displayResponse(parsed);
      } catch (error) {
        console.log('Server response:', response.toString());
      }
    });

    if (this.rl) {
      this.prompt();
    }
  }

  handleClose() {
    this.isConnected = false;
    console.log('Disconnected from server');
    
    if (this.config.server.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(() => {
        });
      }, this.config.server.reconnectDelay);
    } else if (this.rl) {
      this.rl.close();
    }
  }

  handleError(error) {
    console.error('Connection error:', error.message);
  }

  startInteractive() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    this.displayHelp();
    this.prompt();

    this.rl.on('line', (input) => {
      this.handleInput(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }

  async handleInput(input) {
    if (!input) {
      this.prompt();
      return;
    }

    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      this.socket.end();
      this.rl.close();
      return;
    }

    if (!this.isConnected) {
      console.log('Not connected to server. Please wait for reconnection...');
      this.prompt();
      return;
    }

   
    if (input.startsWith('/upload')) {
      try {
       
        const match = input.match(/^\/upload\s+"?([^"]+)"?$/);
        if (!match) {
          console.log('Usage: /upload "C:\\path\\to\\file.txt"');
          this.prompt();
          return;
        }

        const localFilePath = match[1];
        const filename = path.basename(localFilePath);

        if (!fs.existsSync(localFilePath)) {
          console.log('File not found:', localFilePath);
          this.prompt();
          return;
        }

     
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64Content = fileBuffer.toString('base64');

       
        const payload = JSON.stringify({
          command: '/upload',
          filename,
          content: base64Content
        });

        this.socket.write(payload + '\n');
        console.log(`Uploading '${filename}' from ${localFilePath}...`);
      } catch (err) {
        console.error('Upload failed:', err.message);
      }

      this.prompt();
      return;
    }

   
    this.socket.write(input + '\n');
    this.prompt();
  }

  prompt() {
    if (this.rl) {
      this.rl.prompt();
    }
  }

  displayHelp() {
    console.log(`
Available commands:
  General:
    <message>           - Send a text message to server
    STATS               - Get server statistics
    quit/exit           - Disconnect from server

  File operations (Admin only):
    /list [path]        - List files in directory
    /read <filename>    - Read file content
    /upload "<path>"    - Upload existing local file to the server
    /download <filename> - Download file from server
    /delete <filename>  - Delete file from server
    /search <keyword>   - Search for files
    /info <filename>    - Get file information

Examples:
  /list
  /read example.txt
  /upload "C:\\Users\\Admin\\Desktop\\Tasks.txt"
  /search document
  /info example.txt
    `.trim());
  }

  async sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 10000);

      const responseHandler = (data) => {
        clearTimeout(timeout);
        resolve(data.toString());
      };

      this.socket.once('data', responseHandler);
      this.socket.write(command + '\n');
    });
  }
}

module.exports = Client;
