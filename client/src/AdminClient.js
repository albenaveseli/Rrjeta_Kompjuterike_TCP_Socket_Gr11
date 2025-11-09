const Client = require('./Client');

class AdminClient extends Client {
  constructor(config) {
    super(config);
    this.isAdmin = true;
  }

  displayHelp() {
    super.displayHelp();
    console.log('\nNote: You have ADMIN privileges - full access to all commands');
  }
}

module.exports = AdminClient;