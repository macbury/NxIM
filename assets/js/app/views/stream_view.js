var StreamView = Backbone.View.extend({
  tagName: "div",
  className: "stream",

  initialize: function() {
    //App.client.invitations.on("reset", this.contactListRender, this);
    this.contactsView = new ContactsView();
  },

  render: function() {
    html = new EJS({text: Templates['streamViewTemplate']}).render({});
    $(this.el).html(html);

    $(this.el).append(this.contactsView.render().el);
    
    return this;
  },


  unload: function() {
    this.remove();
  }

});