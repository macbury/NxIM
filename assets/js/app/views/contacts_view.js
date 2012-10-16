var ContactsView = Backbone.View.extend({
  tagName: "div",
  className: "contacts-list",

  initialize: function() {
    App.client.invitations.on("reset", this.render, this);
  },

  render: function() {
    $(this.el).empty().append("<ul></ul>");
    this.ul = this.$('ul');
    this.addAllInvitations();
    return this;
  },

  addAllInvitations: function() {
    App.client.invitations.each(function(invitation) {
      console.log(invitation);
    });
  }
});