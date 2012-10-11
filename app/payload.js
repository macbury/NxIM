var ERROR           = require("./error_code");

// class for handling payload, and validating it, first argument is payload to valid, second is a valid payload
var Payload = function(raw_payload, valid_payload) {
  this.raw_payload   = raw_payload;
  this.valid_payload = valid_payload;
}

Payload.prototype.valid = function() {
  var raw_keys    = Object.keys(this.raw_payload);
  var valid_keys  = Object.keys(this.valid_payload)
  if (raw_keys.length != valid_keys.length) {
    return false;
  }

  var valid = true;

  for (var i = 0; i < valid_keys.length; i++) {;
    var valid_key  = valid_keys[i];
    var raw_value  = this.raw_payload[valid_key];
    var valid_type = this.valid_payload[valid_key];

    if (raw_value == undefined) {
      valid = false;
      break;
    }

    this.raw_payload[valid_key] = valid_type(raw_value);
  }
  
  return valid;
}

Payload.prototype.sendValidationError = function(transport) {
  transport.sendError(ERROR.INVALID_PAYLOAD, "The payload is invalid! Valid package is: "+JSON.stringify(this.valid_payload));
};

exports.Payload = Payload;