'use strict';
var defaults = require('lodash.defaults');
var es = require('event-stream');
var gutil = require('gulp-util');
var File = gutil.File;
var jScrambler = require('jscrambler').default;
var path = require('path');

module.exports = function (options) {
  options = defaults(options || {}, {
    keys: {}
  });

  var filesSrc = [];
  var aggregate = function (file) {
    if (file.contents) {
      filesSrc.push(file);
    }
  };
  var scramble = function () {
    var self = this;
    jScrambler
      .protectAndDownload({
        filesSrc: filesSrc,
        keys: {
          accessKey: options.keys.accessKey,
          secretKey: options.keys.secretKey
        },
        applicationId: options.applicationId,
        host: options.host,
        port: options.port,
        params: options.params
      }, function (buffer, file) {
        var cwd = options && options.cwd || process.cwd();
        var relativePath = path.relative(cwd, file);
        self.emit('data', new File({
          path: relativePath,
          contents: buffer
        }));
      })
      .then(function () {
        self.emit('end');
      })
      .catch(function (error) {
        self.emit('error', error);
      });
  };
  return es.through(aggregate, scramble);
};
