const fs = require('fs').promises;
const path = require('path');
const Helpers = require('./utils/helpers');

class FileManager {
  constructor(basePath) {
    this.basePath = basePath;
    this.ensureBasePath();
  }

  async ensureBasePath() {
    try {
      await fs.access(this.basePath);
    } catch {
      await fs.mkdir(this.basePath, { recursive: true });
    }
  }

  async listDirectory(dirPath = '') {
    try {
      const fullPath = path.join(this.basePath, dirPath);
      
      if (!(await Helpers.fileExists(fullPath))) {
        throw new Error('Directory does not exist');
      }

      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const result = [];

      for (const item of items) {
        const itemPath = path.join(fullPath, item.name);
        const stats = await fs.stat(itemPath);
        result.push({
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          ...Helpers.getFileInfo(stats)
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Error listing directory: ${error.message}`);
    }
  }

  async readFile(filename) {
    try {
      if (!Helpers.validateFileName(filename)) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.basePath, filename);
      
      if (!(await Helpers.fileExists(filePath))) {
        throw new Error('File does not exist');
      }

      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        throw new Error('Cannot read directory');
      }

      const content = await fs.readFile(filePath, 'utf8');
      return { content, stats: Helpers.getFileInfo(stats) };
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

  async writeFile(filename, content) {
    try {
      if (!Helpers.validateFileName(filename)) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.basePath, filename);
      await fs.writeFile(filePath, content, 'utf8');
      
      const stats = await fs.stat(filePath);
      return { success: true, stats: Helpers.getFileInfo(stats) };
    } catch (error) {
      throw new Error(`Error writing file: ${error.message}`);
    }
  }

  async deleteFile(filename) {
    try {
      if (!Helpers.validateFileName(filename)) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.basePath, filename);
      
      if (!(await Helpers.fileExists(filePath))) {
        throw new Error('File does not exist');
      }

      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async searchFiles(keyword, searchPath = '') {
    try {
      const fullPath = path.join(this.basePath, searchPath);
      const results = [];

      await this.searchRecursive(fullPath, keyword, results, searchPath);
      return results;
    } catch (error) {
      throw new Error(`Error searching files: ${error.message}`);
    }
  }

  async searchRecursive(currentPath, keyword, results, relativePath = '') {
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        const itemRelativePath = path.join(relativePath, item.name);

        if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
          const stats = await fs.stat(itemPath);
          results.push({
            name: item.name,
            path: itemRelativePath,
            type: item.isDirectory() ? 'directory' : 'file',
            ...Helpers.getFileInfo(stats)
          });
        }

        if (item.isDirectory()) {
          await this.searchRecursive(itemPath, keyword, results, itemRelativePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Skipping directory (no access): ${currentPath}`);
    }
  }

  async getFileInfo(filename) {
    try {
      if (!Helpers.validateFileName(filename)) {
        throw new Error('Invalid filename');
      }

      const filePath = path.join(this.basePath, filename);
      
      if (!(await Helpers.fileExists(filePath))) {
        throw new Error('File does not exist');
      }

      const stats = await fs.stat(filePath);
      return Helpers.getFileInfo(stats);
    } catch (error) {
      throw new Error(`Error getting file info: ${error.message}`);
    }
  }
}

module.exports = FileManager;