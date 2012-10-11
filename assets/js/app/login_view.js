var LoginView = Backbone.View.extend({
  tagName: "div",
  className: "login",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
    Router.client.on("action.session.invalid", this.onSessionInvalid, this);
  },

  onSubmit: function (e) {
    e.preventDefault();
    Router.client.login($(this.el).find('input.login').val(), $(this.el).find('input.password').val());
    $(this.el).find("form").hide();

    return false;
  },

  render: function() {
    html = new EJS({text: Templates['loginViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  onSessionInvalid: function(payload) {
    alert(payload.error);
    $(this.el).find("form").show();
  },

  unload: function() {
    Router.client.off("action.session.invalid", this.onSessionInvalid, this);
    this.remove();
  }

});