var ContactsView = Backbone.View.extend({
  tagName: "div",
  className: "contacts-list",

  initialize: function() {
    App.client.invitations.on("reset", this.render, this);
  },

  render: function() {
    var html = new EJS({text: Templates['contactList']}).render({});
    $(this.el).html(html);
    this.ul = this.$('ul');
    this.addAllInvitations();
    return this;
  },

  addAllInvitations: function() {
    var _this = this;
    App.client.invitations.each(function(invitation) {
      var view = new InvitationRowView({model: invitation});
      _this.ul.append(view.render().el);
    });
  }
});