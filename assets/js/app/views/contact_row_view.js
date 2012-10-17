var ContactRowView = Backbone.View.extend({
  tagName: "li",
  className: "contact",

  events: {
  },


  initialize: function() {
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },

  clear: function() {
    this.model.clear();
  },

  render: function() {
    var html = new EJS({text: Templates['contactRow']}).render(this.model.toJSON());
    this.$el.html(html);
    return this;
  },

});