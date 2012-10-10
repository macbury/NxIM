var Workspace = Backbone.Router.extend({

  routes: {
    "login":                "login",    // #help
    "login/process":        "loginProcess",  // #search/kiwis
    "search/:query/p:page": "search"   // #search/kiwis/p7
  },

  initialize: function() {
    this.loginView = new LoginView();
  },

  login: function() {
    $("#app-content").html(this.loginView.loginWindow().el);
  }, 

  loginProcess: function() {
    $("#app-content").html(this.loginView.loginProcessWindow().el);
    setTimeout(function(){
      Router.navigate("/login/success", { trigger: true });
    },3000);
  },

});

$(document).ready(function(){
  window.Router = new Workspace();
  Backbone.history.start({
    pushState: false
  });

  Router.navigate("/login", { trigger: true });
});