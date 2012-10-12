var RegistrationView = Backbone.View.extend({
  tagName: "div",
  className: "registration",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
    Router.client.on("action.account.token", this.setupToken, this);
    Router.client.on("action.account.validation", this.onValidation, this);
    this.show();
  },

  onSubmit: function (e) {
    e.preventDefault();
    var login                 = this.$("input.login").val();
    var password              = this.$("input.password").val();
    var token                 = this.$("input.token").val();
    var password_confirmation = this.$("input.password_confirmation").val();
    Router.client.register(login, password, password_confirmation, token);
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

  onValidation: function(payload) {
    console.log(payload);
    $(this.el).find("form").show();
  },

  unload: function() {
    Router.client.off("action.account.token", this.setupToken, this);
    Router.client.off("action.account.validation", this.onValidation, this);
    this.remove();
  }

});