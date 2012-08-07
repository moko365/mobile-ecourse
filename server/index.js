var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

// 使用 Object 來對應 pathname 與 request handlers
var handlers = {
   "/": requestHandlers.start,
   "/start": requestHandlers.start,
   "/play": requestHandlers.play
};

// 傳遞 request handler 
server.start(router.route, handlers);
