var LoginView = Backbone.View.extend({
  tagName: "div",
  className: "login",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
    App.client.on("action.session.invalid", this.onSessionInvalid, this);
    App.client.on("action.session.valid", this.onSessionValid, this);
  },

  onSubmit: function (e) {
    e.preventDefault();
    App.client.login($(this.el).find('input.login').val(), $(this.el).find('input.password').val());
    $(this.el).find("form").hide();

    return false;
  },

  render: function() {
    html = new EJS({text: Templates['loginViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  onSessionInvalid: function(payload) {
    noty({text: payload.error, type: "warning"});
    $(this.el).find("form").show();
  },

  onSessionValid: function(payload) {
    App.navigate("/stream", { trigger: true });
    document.title = $(this.el).find('input.login').val();
    App.client.presence("online");
    App.client.getRoster();
    noty({text: "Logged in successful", type: "info"});
  },

  unload: function() {
    App.client.off("action.session.invalid", this.onSessionInvalid, this);
    App.client.off("action.session.valid", this.onSessionValid, this);
    this.remove();
  }

});