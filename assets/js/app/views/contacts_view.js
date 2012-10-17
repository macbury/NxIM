var ContactsView = Backbone.View.extend({
  tagName: "div",
  className: "contacts-list",

  events: {
    "click #addContact": "addContactAction"
  },

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
  },

  addContactAction: function(e){
    e.preventDefault();
    var nick = prompt("Enter login");
    var message = prompt("Enter messge");
    App.client.sendInvitation(nick, message);
  },
});