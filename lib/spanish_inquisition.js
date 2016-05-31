"use strict";

var Primus = require("primus"),
    _      = require("lodash");

var PORT = process.env.PORT || 10001;

var primus = null;

/* istanbul ignore next */
var SpanishInquisition = {
  init: function (path, callBack, onError) {
    primus = Primus.createServer(function () {
      console.log("Connection Established on PORT: " + PORT);
    }, {
      pathname          : "/guilty",
      port              : PORT,
      transformer       : "engine.io",
      iknowhttpsisbetter: true
    });
    primus.save(path, onError);
    if (_.isFunction(callBack)) {
      callBack();
    }
  },

  server: function () {
    primus.on("connection", function (spark) {
      console.log("Connection Received on: " + spark.id);
      spark.write("ohai");

      spark.on("data", function (message) {
        console.log("Received Message: " + message);
      });
    });
  }
};

module.exports = SpanishInquisition;
