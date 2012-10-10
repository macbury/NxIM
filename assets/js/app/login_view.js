var LoginView = Backbone.View.extend({
  tagName: "div",
  className: "login",

  events: {
    "submit form": "onSubmit"
  },

  initialize: function() {
  },

  onSubmit: function (e) {
    e.preventDefault();
    Router.navigate("/login/process", { trigger: true });
    return false;
  },

  loginWindow: function() {
    html = new EJS({text: Templates['loginViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  loginProcessWindow: function() {
    html = new EJS({text: Templates['loginProcessTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },
});