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
  },

  render: function() {
    html = new EJS({element: 'loginViewTemplate'}).render({});
    $(this.el).html(html);
    return this;
  }
});