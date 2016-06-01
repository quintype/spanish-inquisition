"use strict";

var _            = require("lodash"),
    config       = require("../etc/config"),
    express      = require("express"),
    http         = require("http"),
    Primus       = require("primus"),
    Redis        = require("ioredis"),
    metroplex    = require("metroplex"),
    omegaSupreme = require("omega-supreme");

var PORT = process.env.PORT || 10001;

var app = express();

app.set("title", "spanish-inquisition");
app.use(express.static("public"));

/* istanbul ignore next */
var SpanishInquisition = {
  init: function (onSuccess) {
    var server = http.createServer(app),
        primus = new Primus(server, {
          pathname   : "/guilty",
          port       : PORT,
          transformer: "engine.io",
          redis      : Redis.createClient(config.redis.port, config.redis.host),
          namespace  : "nobody-expects"
        });
    primus.use("metroplex", metroplex);
    primus.use("omega-supreme", omegaSupreme);
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
