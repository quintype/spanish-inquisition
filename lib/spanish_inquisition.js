"use strict";

var _         = require("lodash"),
    config    = require("../etc/config"),
    express   = require("express"),
    http      = require("http"),
    Primus    = require("primus"),
    Redis     = require("redis"),
    Multiplex = require("primus-multiplex"),
    Rooms     = require("primus-rooms"),
    Emitter   = require("primus-emitter"),
    Cluster   = require("primus-cluster");

var PORT = process.env.PORT || 10001;

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
              spark.write("you joined room " + room);
              spark.room(room).except(spark.id).write(spark.id + " joined room " + room);
            });
            break;
          case "leave":
            spark.leave(room, function () {
              spark.write("you left room " + room);
            });
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
            if (action === "create") {
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
