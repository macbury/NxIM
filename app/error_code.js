exports.VALIDATION_ERROR          = 6; // attributes are invalid
exports.INTERNAL_SEVER_ERROR      = 5; // something bad happened on the server side(db connection lost)
exports.INVALID_PASSWORD_OR_LOGIN = 4; // when user enter invalid login or password
exports.ALREADY_AUTHORIZED        = 3; // when user want authorize, authorized connection(relogin)
exports.INVALID_MESSAGE           = 2; // when sended message dont have valid format
exports.INVALID_PAYLOAD           = 1; // when trying exec action not supported by server
exports.INVALID_ACTION            = 0; // when trying exec action not supported by server