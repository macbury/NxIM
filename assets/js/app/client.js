var Client = function(host) {
  this.connected = false;
  this.token = null;
}

_.extend(Client.prototype, Backbone.Events, {

  connect: function(host) {
    this.connected = true;
    this.socket = io.connect(host);

    var _this = this;
    this.socket.on("disconnect", function(response){
      _this.onDisconnect();
    });
    this.socket.on("message", function(response){
      _this.onMessage(response);
    });

    this.on("action.session.start", this.onSession, this);
  },

  onSession: function(payload) {
    this.token = payload["token"];
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
    var password_hash = CryptoJS.SHA512(password).toString();
    var hash          = CryptoJS.SHA512(password_hash + this.token).toString();
    this.sendAction("session.create", {
      login:    login,
      password: hash
    });
  }, 

  presence: function(presence) {
    this.sendAction("presence.set", {
      presence: presence
    });
  },

  register: function(login, password, password_confirmation, token) {
    this.sendAction("account.create", {
      login:    login,
      password: password,
      password_confirmation: password_confirmation,
      token: token
    });
  },

  onMessage: function(response) {
    var error       = response.error;

    if (error != null) {
      alert(error);
    } else {
      var action_name = response.action;
      var payload     = response.payload;
    
      this.trigger('action.'+action_name, payload);
    }
  }
})