const Helpers = require("./utils/helpers");
const fs = require("fs").promises;
const path = require("path");

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
    this.trafficMonitor.connectionEstablished(
      this.clientId,
      this.socket.remoteAddress
    );

    this.socket.on("data", (data) => {
      this.handleData(data);
    });

    this.socket.on("close", () => {
      this.handleClose();
    });

    this.socket.on("error", (error) => {
      this.handleError(error);
    });

    console.log(
      `Client connected: ${this.clientId} (${
        this.isAdmin ? "Admin" : "Read-only"
      })`
    );
  }

  setupTimeout() {
    this.resetTimeout();

    this.socket.on("data", () => {
      this.resetTimeout();
    });
  }

  resetTimeout() {
    if (this.timeout) clearTimeout(this.timeout);

    const timeoutDuration = this.isAdmin
      ? this.config.server.adminTimeout || 5000
      : this.config.server.connectionTimeout;

    this.timeout = setTimeout(() => {
      if (this.isConnected) {
        console.log(`Connection timeout for client: ${this.clientId}`);
        this.socket.end("Connection timeout");
      }
    }, timeoutDuration);
  }

  async handleData(data) {
    try {
      const message = data.toString().trim();
//  Minimal delay for read-only clients
     if (!this.isAdmin) {
        console.log(`[READ-ONLY] Delaying response by 1000ms for ${this.clientId}: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      }
      this.trafficMonitor.messageReceived(this.clientId, data.length);
      console.log(`Received from ${this.clientId}: ${message}`);

      if (message.startsWith("{") && message.endsWith("}")) {
        const parsed = JSON.parse(message);
        if (parsed.command === "/upload") {
          await this.handleUploadJSON(parsed);
          return;
        }
      }

      if (message === "STATS") {
        await this.handleStats();
      } else if (message.startsWith("/")) {
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
    this.sendResponse("STATS_RESPONSE", stats);
  }

  async handleCommand(command) {
    if (
      !this.isAdmin &&
      !command.startsWith("/list") &&
      !command.startsWith("/read") &&
      !command.startsWith("/search") &&
      !command.startsWith("/info")
    ) {
      this.sendError("Insufficient permissions");
      return;
    }

    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case "/list":
          await this.handleList(args);
          break;
        case "/read":
          await this.handleRead(args);
          break;
        case "/upload":
          await this.handleUploadLegacy(args, command);
          break;
        case "/download":
          await this.handleDownload(args);
          break;
        case "/delete":
          await this.handleDelete(args);
          break;
        case "/search":
          await this.handleSearch(args);
          break;
        case "/info":
          await this.handleInfo(args);
          break;
        default:
          this.sendError("Unknown command");
      }
    } catch (error) {
      this.sendError(error.message);
    }
  }

  async handleList(args) {
    const dirPath = args[0] || "";
    const items = await this.fileManager.listDirectory(dirPath);
    this.sendResponse("LIST_RESPONSE", items);
  }

  async handleRead(args) {
    if (args.length === 0) throw new Error("Filename required");
    const result = await this.fileManager.readFile(args[0]);
    this.sendResponse("READ_RESPONSE", result);
  }

  async handleUploadJSON(payload) {
    try {
      const { filename, content } = payload;
      if (!filename || !content) {
        throw new Error("Invalid upload payload");
      }

      const buffer = Buffer.from(content, "base64");
      const saveDir = this.config.server.uploadDir || "./uploads";
      const savePath = path.join(saveDir, filename);

      await fs.mkdir(saveDir, { recursive: true });
      await fs.writeFile(savePath, buffer);

      console.log(`File uploaded successfully: ${savePath}`);
      this.sendResponse("UPLOAD_RESPONSE", {
        message: `File '${filename}' uploaded successfully.`,
        path: savePath,
      });
    } catch (err) {
      console.error("Upload failed:", err.message);
      this.sendError("Upload failed: " + err.message);
    }
  }

  async handleUploadLegacy(args, fullCommand) {
    if (args.length < 2) {
      throw new Error("Usage: /upload <filename> <content>");
    }

    const filename = args[0];
    const contentStart = fullCommand.indexOf(filename) + filename.length + 1;
    const content = fullCommand.substring(contentStart);
    const saveDir = this.config.server.uploadDir || "./uploads";
    const savePath = path.join(saveDir, filename);

    await fs.mkdir(saveDir, { recursive: true });
    await fs.writeFile(savePath, content, "utf8");

    console.log(`File uploaded (legacy mode): ${savePath}`);
    this.sendResponse("UPLOAD_RESPONSE", {
      message: `File '${filename}' uploaded successfully (legacy mode).`,
      path: savePath,
    });
  }

  async handleDownload(args) {
    if (args.length === 0) throw new Error("Filename required");
    const result = await this.fileManager.readFile(args[0]);
    this.sendResponse("DOWNLOAD_RESPONSE", result);
  }

  async handleDelete(args) {
    if (args.length === 0) throw new Error("Filename required");
    const result = await this.fileManager.deleteFile(args[0]);
    this.sendResponse("DELETE_RESPONSE", result);
  }

  async handleSearch(args) {
    if (args.length === 0) throw new Error("Keyword required");
    const results = await this.fileManager.searchFiles(args[0]);
    this.sendResponse("SEARCH_RESPONSE", results);
  }

  async handleInfo(args) {
    if (args.length === 0) throw new Error("Filename required");
    const info = await this.fileManager.getFileInfo(args[0]);
    this.sendResponse("INFO_RESPONSE", info);
  }

  async handleMessage(message) {
    const timestamp = new Date().toISOString();

   
    const response = {
      timestamp,
      message: `Echo: ${message}`,
      client: this.clientId,
    };

   
    await this.logClientMessage(message, timestamp);

    
    this.sendResponse("MESSAGE_RESPONSE", response);
  }
  async logClientMessage(message, timestamp) {
  try {
    const fs = require("fs").promises;
    const path = require("path");

    const logDir = path.join(__dirname, "../logs");
    const logFile = path.join(logDir, "messages.txt");

    
    await fs.mkdir(logDir, { recursive: true });

   
    const logEntry = `[${timestamp}] ${this.clientId}: ${message}\n`;

   
    await fs.appendFile(logFile, logEntry, "utf8");
  } catch (err) {
    console.error("Error logging message:", err.message);
  }
}


  sendResponse(type, data) {
    const response = {
      type,
      data,
      timestamp: new Date().toISOString(),
      isAdmin: this.isAdmin,
    };
    const responseStr = JSON.stringify(response);
    this.socket.write(responseStr + "\n");
    this.trafficMonitor.messageSent(
      this.clientId,
      Buffer.byteLength(responseStr)
    );
  }

  sendError(message) {
    this.sendResponse("ERROR", { message });
  }

  handleClose() {
    this.isConnected = false;
    if (this.timeout) clearTimeout(this.timeout);
    this.trafficMonitor.connectionClosed(this.clientId);
    console.log(`Client disconnected: ${this.clientId}`);
  }

  handleError(error) {
    console.error(`Client error (${this.clientId}):`, error.message);
  }
}

module.exports = ClientHandler;
