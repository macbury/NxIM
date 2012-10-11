var Workspace = Backbone.Router.extend({

  routes: {
    "login":                "login",
    "disconnect":           "disconnect"
  },

  initialize: function() {
    this.client    = new Client();
    this.client.connect(socket_url);
  },

  login: function() {
    if (this.loginView) {
      this.loginView.unload();
      this.loginView = null;
    }
    this.loginView = new LoginView();
    $("#app-content").html(this.loginView.render().el);
  }, 

  disconnect: function() {
    $("#app-content").html("Lost connection...");
  }

});

$(document).ready(function(){
  var Router = new Workspace();
  window.Router = Router;
  Backbone.history.start({
    pushState: false
  });

  Router.navigate("/login", { trigger: true });
});