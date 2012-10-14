var StreamView = Backbone.View.extend({
  tagName: "div",
  className: "stream",

  initialize: function() {
    Router.client.on("action.roster.list", this.setupRoster, this);
    Router.client.sendAction("roster.all", {});
  },

  render: function() {
    html = new EJS({text: Templates['streamViewTemplate']}).render({});
    $(this.el).html(html);
    return this;
  },

  setupRoster: function(payload) {
    console.log(payload);
  },

  unload: function() {
    Router.client.off("action.roster.list", this.setupRoster, this);
    this.remove();
  }

});