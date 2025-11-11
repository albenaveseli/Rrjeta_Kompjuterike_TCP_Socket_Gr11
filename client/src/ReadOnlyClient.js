const Client = require("./Client");

class ReadOnlyClient extends Client {
  constructor(config) {
    super(config);
    this.isAdmin = false;
  }

  displayHelp() {
    console.log(
      `
Available commands (Read-only access):
  <message>          - Send a text message to server
  STATS              - Get server statistics
  /list [path]       - List files in directory
  /read <filename>   - Read file content
  /search <keyword>  - Search for files
  /info <filename>   - Get file information
  quit/exit          - Disconnect from server

Note: You have READ-ONLY privileges - limited to viewing operations only
    `.trim()
    );
  }

  handleInput(input) {
    if (
      input.startsWith("/") &&
      !input.startsWith("/list") &&
      !input.startsWith("/read") &&
      !input.startsWith("/search") &&
      !input.startsWith("/info") &&
      input !== "STATS"
    ) {
      console.log("Error: Read-only clients cannot execute this command");
      this.prompt();
      return;
    }

    super.handleInput(input);
  }
}

module.exports = ReadOnlyClient;
