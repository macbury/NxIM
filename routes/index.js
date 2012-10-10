var fs     = require("fs");
var logger = require("nlogger").logger(module);

exports.index = function(req, res){
  var base_template_directory = "./public/templates/";
  var template_filenames = fs.readdirSync(base_template_directory);
  var template_hash      = {};
  for (var i = 0; i < template_filenames.length; i++) {
    var file_name      = template_filenames[i];
    var key            = file_name.split(".")[0];
    template_hash[key] = fs.readFileSync(base_template_directory+file_name, "UTF-8");
    logger.info("Loaded backbone template: "+ file_name);
  };
  res.render('index', { title: 'Express', templates: template_hash });
};