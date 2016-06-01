"use strict";

var express  = require("express"),
    http     = require("http"),
    Primus   = require("primus"),
    _        = require("lodash");

var PORT = process.env.PORT || 10001;

var app = express();

app.use(express.static("public"));

/* istanbul ignore next */
var SpanishInquisition = {
  init: function (onSuccess) {
    var server = http.createServer(app),
        primus = new Primus(server, {
          pathname   : "/guilty",
          port       : PORT,
          transformer: "engine.io"
        });
    if (_.isFunction(onSuccess)) {
      onSuccess(server, primus);
    }
  },

  server: function (server, primus) {
    primus.on("connection", function (spark) {
      console.log("Connection Received on: " + spark.id);
      spark.write("ohai");

      spark.on("data", function (message) {
        console.log("Received Message: " + message);
      });
    });
    server.listen(PORT, function (error) {
      global.console.log("Running Server on PORT: " + PORT);
      if (!_.isEmpty(error)) {
        global.console.error(error);
      }
    });
  }
};

module.exports = SpanishInquisition;
