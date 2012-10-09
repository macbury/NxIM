var Workspace = Backbone.Router.extend({

  routes: {
    "login":                "login",    // #help
    "search/:query":        "search",  // #search/kiwis
    "search/:query/p:page": "search"   // #search/kiwis/p7
  },

  login: function() {
    loginView = new LoginView();
    $("#app-content").html(loginView.render().el);
  }

});

$(document).ready(function(){
  window.Router = new Workspace();
  Backbone.history.start({
    pushState: false
  });

  Router.navigate("/login", { trigger: true });
});