var RegistrationView = Backbone.View.extend({
  tagName: "div",
  className: "registration",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
    Router.client.on("action.account.token", this.setupToken, this);
    this.show();
  },

  onSubmit: function (e) {
    e.preventDefault();
    Router.client.register($(this.el).find('input.login').val(), $(this.el).find('input.password').val());
    $(this.el).find("form").hide();

    return false;
  },

  render: function() {
    html = new EJS({text: Templates['registrationViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  show: function() {
    this.render();
    Router.client.sendAction("account.init", {});
    return this;
  },

  setupToken: function(payload) {
    $(this.el).find(".token").attr("src", payload.image);
  },

  unload: function() {
    Router.client.off("action.account.token", this.setupToken, this);
    this.remove();
  }

});