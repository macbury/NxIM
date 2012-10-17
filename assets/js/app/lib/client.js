var Client = function(host) {
  this.connected = false;
  this.token = null;
  this.invitations = new InvitationsCollection();
  this.contacts    = new ContactsCollection();
  this.on("action.roster.index", this.setupRoster, this);
  this.on("action.roster.invitation", function(payload){
    this.getRoster();
  }, this);

  this.on("action.roster.accepted", function(payload){
    console.log("Accepted invitations!");
    this.getRoster();
  }, this);

  this.on("action.presence.change", this.presenceChange, this);
}

_.extend(Client.prototype, Backbone.Events, {

  presenceChange: function(payload) {
    this.contacts.each(function(contact) {
      if (contact.get('login') == payload.from) {
        contact.set('presence', payload.presence);
      }
    });
  },

  getRoster: function() {
    this.sendAction("roster.all", {})
  },
  setupRoster: function(payload) {
    this.invitations.reset(payload.invitations);
    this.contacts.reset(payload.contacts);
  },

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
    App.navigate("/disconnect", { trigger: true });
  },

  sendInvitation: function(login, message) {
    this.sendAction("roster.add", { login: login, message: message });
  },

  acceptInvitation: function(login) {
    this.sendAction("roster.accept", { login: login });
  },

  sendAction: function(action_name, payload) {
    if (this.connected) {
      this.socket.emit('message', { action: action_name, payload: payload })
    }

    console.log("Sended: "+action_name);
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
      console.log("Recived: "+action_name);
      this.trigger('action.'+action_name, payload);
    }
  }
})