var Workspace = Backbone.Router.extend({

  routes: {
    "login":                "login", 
    "login/process":        "loginProcess", 
    "disconnect":           "disconnect"
  },

  initialize: function() {
    this.client    = new Client();
    this.client.connect(socket_url);
    this.loginView = new LoginView();
  },

  login: function() {
    $("#app-content").html(this.loginView.loginWindow().el);
  }, 

  disconnect: function() {
    $("#app-content").html("Lost connection...");
  },

  loginProcess: function() {
    $("#app-content").html(this.loginView.loginProcessWindow().el);
    setTimeout(function(){
      Router.navigate("/login/success", { trigger: true });
    },3000);
  },

});

$(document).ready(function(){
  var Router = new Workspace();
  window.Router = Router;
  Backbone.history.start({
    pushState: false
  });

  Router.navigate("/login", { trigger: true });
});