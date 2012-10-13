var StreamView = Backbone.View.extend({
  tagName: "div",
  className: "stream",

  initialize: function() {

  },

  render: function() {
    html = new EJS({text: Templates['streamViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  unload: function() {
    this.remove();
  }

});