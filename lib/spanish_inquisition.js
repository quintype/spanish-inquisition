"use strict";

var _         = require("lodash"),
    express   = require("express"),
    http      = require("http"),
    Primus    = require("primus"),
    Redis     = require("redis"),
    Multiplex = require("primus-multiplex"),
    Rooms     = require("primus-rooms"),
    Emitter   = require("primus-emitter"),
    Cluster   = require("primus-cluster"),
    config;

try {
  config = require("/etc/spanish-inquisition/config");
} catch (err) {
  config = require("../etc/config");
}

var PORT = process.env.PORT || 10001;

var channels = [];

var app = express();

app.set("title", "spanish-inquisition");
app.use(express.static("public"));

/* istanbul ignore next */
var roomOnConnection   = function (spark) {
      spark.on("data", function (data) {
        data       = data || {};
        var action = data.action;
        var room   = data.room;
        switch (action) {
          case "join":
            spark.join(room, function () {
              spark.in(room).except(spark.id).write(JSON.stringify({
                timestamp: new Date().toISOString(),
                payload  : spark.id + " joined room " + room
              }));
            });
            break;
          case "leave":
            spark.leave(room, function () {
              spark.in(room).except(spark.id).write(JSON.stringify({
                timestamp: new Date().toISOString(),
                payload  : "you left room " + room
              }));
            });
            break;
          case "send":
            spark.in(room).except(spark.id).write(JSON.stringify({
              timestamp: new Date().toISOString(),
              payload  : _.get(data, "message.payload")
            }));
            break;
        }
      });
    },
    SpanishInquisition = {
      init: function (onSuccess) {
        var server = http.createServer(app),
            primus = new Primus(server, {
              pathname   : "/guilty",
              port       : PORT,
              transformer: "engine.io",
              cluster    : {
                redis  : function () {
                  return Redis.createClient(config.redis);
                },
                channel: "nobody-expects",
                ttl    : 86400
              }
            });
        primus.use("multiplex", Multiplex);
        primus.use("rooms", Rooms);
        primus.use("emitter", Emitter);
        primus.use("cluster", Cluster);
        if (_.isFunction(onSuccess)) {
          onSuccess(server, primus);
        }
      },

      server: function (server, primus) {
        primus.on("connection", function (spark) {
          spark.on("data", function (data) {
            data        = data || {};
            var action  = data.action;
            var channel = data.channel;
            if (action === "create" && !_.includes(channels, channel)) {
              channels.push(channel);
              primus.channel(channel).on("connection", roomOnConnection);
            }
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
