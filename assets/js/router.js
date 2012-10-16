var Workspace = Backbone.Router.extend({

  routes: {
    "login":                "login",
    "register":             "registerAction",
    "disconnect":           "disconnect",
    "stream":               "stream"
  },

  initialize: function() {
    this.client    = new Client();
    this.client.connect(socket_url);
  },

  registerAction: function() {
    this.setView(new RegistrationView());
  },

  stream: function() {
    this.setView(new StreamView());
  },

  login: function() {
    this.setView(new LoginView());
  }, 

  disconnect: function() {
    $("#app-content").html("Lost connection...");
  }, 

  currentView: null,
  setView: function(newView) {
    if (this.currentView) {
      this.currentView.unload();
      this.currentView = null;
    }

    this.currentView = newView;
    $("#app-content").html(this.currentView.render().el);
  }

});

$(document).ready(function(){
  var Router = new Workspace();
  window.App = Router;
  Backbone.history.start({
    pushState: false
  });

  Router.navigate("/login", { trigger: true });
});