(function($) {
var ws;

// this is the instance of Div #message
var content;
var course_list;
var player;

$.fn.bindCourseList = function() {
    course_list = this;
}

$.fn.bindPlayer = function() {
    player = this;
}

$.fn.play = function(cb) {
    // Callback this API
    ws.send(cb);
}

function onWsMessage(message) {
   var json = JSON.parse(message.data);
   if (json.type === 'player') {
	player.html('<video autoplay="autoplay" controls="controls" poster="">' +
    			'<source src="' + json.data.url + '" type="video/ogg">' +
			'</video>');
   } else if (json.type === 'list') {
   	var list = json.data.list;
	content.html("<h2>Your course</h2>");
	for (i = 0; i < list.length; i++) {
   	   course_list.append('<div><h3>Video: <button onClick="$(\'player\').play(\'http://svn.moko365.com:8888/play?s=' + list[i].videokey + '\')">' +
				list[i].title + '</button></h3></div>');
	}
   }
}

$.fn.createWebSocket = function () {

  content = this;

  if ("WebSocket" in window)
  {
     // Let us open a web socket
     ws = new WebSocket("ws://svn.moko365.com:8888/", ['echo-protocol']);
     ws.onopen = function()
     {
	content.append("<h2>Succcess</h2>");
     };

     ws.onmessage = onWsMessage;

     ws.onclose = function()
     { 
        content.html("<h1>Closed</h1>");
     };
     ws.onerror = function()
     { 
        content.html("<h1>Error</h1>");
     };
  }
  else
  {
     // The browser doesn't support WebSocket
     alert("WebSocket NOT supported by your Browser!");
  }
};

})(jQuery);
