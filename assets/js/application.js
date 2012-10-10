//= require_tree ./lib
//= require_tree ./app
//= require router

$(document).ready(function(){
  console.log("Hello!");

  window.socket = io.connect('http://localhost');
  socket.on("message", function(response){
    console.log(response);
  });

  socket.on("disconnect", function(response){
    Router.navigate("/disconnect", { trigger: true });
  });
  
  socket.emit('message', { 
    action: "authenticate",
    payload: {
      login:    "macbury",
      passowrd: "test1234"
    }
  });
});