var querystring = require('querystring'); 

/**
 * Global variables
 */
var history = [ ];

/**
 * HTTP client connections
 */
var httpClients = [ ];

/*
 *
 * @response
 * @query
 * @wsClientConn
 */
function start(response, query, wsClientConn) {
    console.log("Handler 'start' is started.");
    console.log("Process query: " + query);

    var parsedstring = querystring.parse(query);

    var obj = {
	username: parsedstring.u,
	license: parsedstring.k,	// License Key
        timestamp: (new Date()).getTime(),
	session: 0,
	list: []
    };

    httpClients.push(obj);
    console.log("User: " + obj.username + ", License: " + obj.license);

    // Generate video list in JSON
    obj.list = [
		{title: "test1", videokey: "12345"},
		{title: "test2", videokey: "23456"},
	       ];
    var json = JSON.stringify({ type: 'list', data: obj });

    // Send JSON to this client
    wsClientConn.sendUTF(json);
}

function play(response, query, wsClientConn) {
    console.log("Handler 'play' is started.");

    var parsedstring = querystring.parse(query); 

    // Generate URLs with video key
    //var generatedUrl = "http://svn.moko365.com/course-server/server/db/1.mp4";
    var generatedUrl = "http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv";

    var obj = {
        session: parsedstring.s,		// Session
        videokey: parsedstring.k,		// Video key
	url: generatedUrl,
        timestamp: (new Date()).getTime()
    };

    history.push(obj);

    //////// DEBUG ////////
    for (var i = 0; i < history.length; i++) {
        console.log("["+i+"]: " + history[i].url);
    }

    console.log("Generating course using key [" + obj.videokey + "]: " + generatedUrl);

    // Start video streaming using client's HTML5 video tag
    var json = JSON.stringify({ type: 'player', data: obj });
    wsClientConn.sendUTF(json);
}

exports.start = start;
exports.play = play;
