var AppView = Backbone.View.extend({
  el: $("#app-content"),
  initialize: function() {
    this.render();
  },

  render: function() {
    $(this.el).empty();

  }
});