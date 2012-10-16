var StreamView = Backbone.View.extend({
  tagName: "div",
  className: "stream",

  initialize: function() {
    //App.client.invitations.on("reset", this.contactListRender, this);
  },

  render: function() {
    html = new EJS({text: Templates['streamViewTemplate']}).render({});
    $(this.el).html(html);

    var contact = $('.contact').clone();
    for (var i = 0; i < 100; i++) {
      $('.contacts-list ul').append(contact.clone());
    }
    $(".nano").nanoScroller();
    return this;
  },


  unload: function() {
    this.remove();
  }

});