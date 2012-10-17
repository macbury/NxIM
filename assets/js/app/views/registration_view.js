var RegistrationView = Backbone.View.extend({
  tagName: "div",
  className: "registration",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
    App.client.on("action.account.token", this.setupToken, this);
    App.client.on("action.account.ready", this.accountReady, this);
    App.client.on("action.account.validation", this.onValidation, this);
    this.show();
  },

  onSubmit: function (e) {
    e.preventDefault();
    var login                 = this.$("input.login").val();
    var password              = this.$("input.password").val();
    var token                 = this.$("input.token").val();
    var password_confirmation = this.$("input.password_confirmation").val();
    App.client.register(login, password, password_confirmation, token);
    $(this.el).find("form").hide();

    return false;
  },

  render: function() {
    var html = new EJS({text: Templates['registrationViewTemplate']}).render({});
    $(this.el).html(html);
    this.$('.alert').hide();
    return this;
  },

  show: function() {
    this.render();
    App.client.sendAction("account.init", {});
    return this;
  },

  setupToken: function(payload) {
    $(this.el).find(".token").attr("src", payload.image);
  },

  onValidation: function(payload) {
    this.$("form").show();

    if (payload.problems.length == 0) {
      this.$('.alert').hide();
    } else {
      noty({text: 'Could not create account', type: "error"});
      this.$('.alert').show();
      this.$('.alert .body').empty();
      for (var i = payload.problems.length - 1; i >= 0; i--) {
        var error = payload.problems[i];
        this.$('.alert .body').append(error + '<br />');
      };
    }
  },

  accountReady: function(payload) {
    App.navigate("/login", { trigger: true });
    noty({text: 'Account created, you can now log in', type: "success"});
  },

  unload: function() {
    App.client.off("action.account.token", this.setupToken, this);
    App.client.off("action.account.validation", this.onValidation, this);
    App.client.off("action.account.ready", this.accountReady, this);
    this.remove();
  }

});