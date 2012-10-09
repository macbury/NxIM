UserMode = {
  Guest: 0x00
}

function User() {
  this.transports = []
  this.mode = UserMode.Guest;
}

User.prototype.pushTransport = function(socketTransport) {
  socketTransport.user = this;
  this.transports.push(socketTransport);
}

User.prototype.popTransport = function(socketTransport) {
  var index = this.transports.indexOf(socketTransport);

  if (index >= 0) {
    delete this.transports[index];
    this.transports.splice(index, 1);
  };
}

exports.User     = User;
exports.UserMode = UserMode;