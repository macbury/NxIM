var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;
var Presence        = require("../db").UserPresence;

exports.commands = {

  "roster.all": function(transport, payload) {
    var payload = new Payload(payload, {});
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        transport.user.getPendingInvitations(function(invitations){
          transport.user.getContacts().success(function(contacts) {
            var vCardArray = [];
            for (var i = 0; i < contacts.length; i++) {
              vCardArray.push(contacts[i].toCard());
            }
            transport.sendAction("roster.index", { user: transport.user.toCard(), contacts: vCardArray, invitations: invitations }); 
          });
          
        });
         
      } else {
        payload.sendValidationError(transport, "roster.index");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in fetch user roster");
    }
  }, 

  "roster.add": function(transport, payload) {
    var payload = new Payload(payload, { login: String, message: String });
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        logger.info("Inviting user: "+ payload.get("login"))
        transport.user.invite(payload.get('login'), payload.get('message'), function(invited_user, invitation){
          if (invited_user) {
            _this.sendActionTo("roster.invitation", { message: invitation.message, from: transport.user.login }, invited_user);
          }
        });
      } else {
        payload.sendValidationError(transport, "roster.add");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to add user");
    }
  },

  "roster.accept": function(transport, payload) {
    var payload = new Payload(payload, { login: String });
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        logger.info("Accepting user: "+ payload.get("login"))
        transport.user.accept(payload.get('login'), function(accepted_user){
          _this.sendActionTo("roster.accepted", { from: transport.user.login }, accepted_user);
          _this.sendActionTo("roster.accepted", { from: accepted_user.login }, transport.user);
        });
      } else {
        payload.sendValidationError(transport, "roster.accept");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to accpet user");
    }
  }

}