var Client = function(host) {
  this.connected = false;
  socket.on("message", function(response){
    console.log(response);
  });

  socket.on("disconnect", function(response){
    Router.navigate("/disconnect", { trigger: true });
  });
  
  socket.emit('message', { 
    action: "authenticate",
    payload: {
      login:    "macbury",
      passowrd: "test1234"
    }
  });
}

_.extend(Client.prototype, Events, {

  connect: function(host) {
    this.connected = true;
    this.socket = io.connect('http://localhost');

    _this = this;
    this.socket.on("disconnect", function(response){
      _this.onDisconnect();
    });
    this.socket.on("message", function(response){
      console.log(response);
    });
  },

  onDisconnect: function() {
    connected = false;
    Router.navigate("/disconnect", { trigger: true });
  },

  sendAction: function(action_name, payload) {
    if (this.connected) {
      this.socket.emit('message', { action: action_name, payload: payload })
    }
  },

  login: function(login, password) {
    this.sendAction("authenticate", {
      login:    "macbury",
      passowrd: "test1234"
    });
  }
})