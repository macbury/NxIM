var InvitationRowView = Backbone.View.extend({
  tagName: "li",
  className: "invitation",

  events: {
    "click .acceptButton": "acceptAction"
  },

  acceptAction: function(e) {
    e.preventDefault();
    App.client.acceptInvitation(this.model.get('login'));
    this.remove();
  },

  initialize: function() {
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },

  clear: function() {
    this.model.clear();
  },

  render: function() {
    var html = new EJS({text: Templates['invitationRow']}).render(this.model.toJSON());
    this.$el.html(html);
    this.input = this.$('.edit');
    return this;
  },

});