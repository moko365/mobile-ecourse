var http = require("http");
var url = require("url");
var WebSocketServer = require('websocket').server;

function start(route, handlers) {
  // Websocket connection of this client
  var wsClientConn;
  var httpResponse;

  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;

    console.log("Request for " + pathname + " received.");

    //
    httpResponse = response;

    route(pathname, handlers, response, query, wsClientConn);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  var server = http.createServer(onRequest).listen(8888, function() {
     console.log("Server has started and is listening on port 8888.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  function onWsConnMessage(message) {
    if (message.type == 'utf8') {
      console.log('Received message: ' + message.utf8Data);
      // We just route message (the query string)
      var pathname = url.parse(message.utf8Data).pathname;
      var query = url.parse(message.utf8Data).query;

      route(pathname, handlers, httpResponse, query, wsClientConn);
      
    } else if (message.type == 'binary') {
      console.log('Received binary data.');
    }
  }

  function onWsConnClose(reasonCode, description) {
    console.log(' Peer disconnected with reason: ' + reasonCode);
  }

  function onWsRequest(request) {
    var connection = request.accept('echo-protocol', request.origin);
    console.log("WebSocket connection accepted, origin is " + request.origin);

    wsClientConn = connection;

    connection.on('message', onWsConnMessage);
    connection.on('close', onWsConnClose);
  }

  wsServer.on('request', onWsRequest);
}

// Export functions
exports.start = start;
