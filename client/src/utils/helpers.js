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
  }}