var http = require("http");
var https = require("https");
var url = require("url");
var fs = require("fs");
var WebSocketServer = require('websocket').server,
    WebSocketRequest = require('websocket').request;

// WebSocket-Node config
var wsServerConfig =  {
    // All options *except* 'httpServer' are required when bypassing
    // WebSocketServer.
    maxReceivedFrameSize: 0x10000,
    maxReceivedMessageSize: 0x100000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 0x4000,
    keepalive: true,
    keepaliveInterval: 20000,
    assembleFragments: true,
    // autoAcceptConnections is not applicable when bypassing WebSocketServer
    // autoAcceptConnections: false,
    disableNagleAlgorithm: true,
    closeTimeout: 5000
};

//Copy to WebSocketRequest
WebSocketRequest.prototype.connections = [];
WebSocketRequest.prototype.handleRequestAccepted = WebSocketServer.prototype.handleRequestAccepted;
WebSocketRequest.prototype.handleConnectionClose = WebSocketServer.prototype.handleConnectionClose;
WebSocketRequest.prototype.broadcastUTF = WebSocketServer.prototype.broadcastUTF;

function start(route, handlers) {
  // Websocket connection of this client
  var wsClientConn;
  var httpResponse;

  // WebSocketRequest
  var wsRequest={};

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

  // WebSocket library fallback for old protocol clients
  // See https://gist.github.com/1428579
  function onUpgrade(req, socket, head) {
    if (typeof req.headers['sec-websocket-version'] !== 'undefined') {

        // WebSocket hybi-08/-09/-10 connection (WebSocket-Node)
        wsRequest = new WebSocketRequest(socket, req, wsServerConfig);
        try {
            wsRequest.readHandshake();
            var connection = wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
            wsRequest.handleRequestAccepted(connection);

	    // Handle connection
    	    connection.on('message', onWsConnMessage);
    	    connection.on('close', onWsConnClose);

	    wsClientConn = connection;
        }
        catch(e) {
            console.log("WebSocket Request unsupported by WebSocket-Node: " + e.toString());
            return;
        }
    }
  }

  var options = {
    key: fs.readFileSync('tests/fixtures/keys/key.pem'),
    cert: fs.readFileSync('tests/fixtures/keys/cert.pem')
  };

  var server = https.createServer(options, onRequest).listen(8888, function() {
     console.log("Server has started and is listening on port 8888.");
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  //server.on('upgrade', onUpgrade);

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
