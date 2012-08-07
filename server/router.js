function route(pathname, handlers, response, query, wsClientConn) {
    console.log("Route this request: '" + pathname + "'");

    // 檢查 pathname 是否有對應的 request handlers
    if (typeof handlers[pathname] == "function") {
        handlers[pathname](response, query, wsClientConn);
    } else {
        console.log("No request handler for this pathname: '" + pathname + "'");
    }
}

exports.route = route;
