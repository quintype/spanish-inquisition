"use strict";

var should = require("should");

var SpanishInquisition = require("../lib/spanish_inquisition");

describe("SpanishInquisition", function () {
  it("should exist and not be empty", function () {
    should.exist(SpanishInquisition);
    SpanishInquisition.should.not.be.empty();
  });
});
