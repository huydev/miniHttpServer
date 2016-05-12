'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.miniHS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _mime = require('./mime.json');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var miniHttpServer = function () {
  function miniHttpServer(port) {
    _classCallCheck(this, miniHttpServer);

    this.path = '';
    this.port = port || 3000;
    this.root = '';
  }

  _createClass(miniHttpServer, [{
    key: 'run',
    value: function run() {
      var _this = this;

      _http2.default.createServer(function (req, res) {
        if (req.url == '/favicon.ico') {
          return res.end('');
        }
        var urlOjb = _url2.default.parse(req.url);
        _this.root = process.cwd();

        _this.path = _path3.default.normalize(_this.root + urlOjb.pathname);

        res.setHeader('Content-Type', 'text/plain;charset=utf8;');

        _this.getStats().then(function (stats) {
          if (stats.isFile()) {
            _this.dealFile(req, res).then(function (data) {
              res.write(data);
              res.end();
            }).catch(function (err) {
              console.log('aaa' + err);
            });
          } else if (stats.isDirectory()) {
            _this.dealPath(req, res).then(function (data) {
              res.write(data);
              res.end();
            }).catch(function (err) {
              console.log('bbb' + err);
            });
          } else {
            res.write('404');
            res.end();
          }
        }).catch(function (err) {
          console.log('ccc' + err);
        });
      }).listen(this.port, function () {
        console.log('server start at ' + _this.port);
      });
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        _fs2.default.stat(_this2.path, function (err, stats) {

          if (err) return reject(err);
          resolve(stats);
        });
      });
      return promise;
    }
  }, {
    key: 'dealFile',
    value: function dealFile(req, res) {
      var _this3 = this;

      //处理文件
      var promise = new Promise(function (resolve, reject) {
        _fs2.default.readFile(_this3.path, function (err, data) {
          if (err) return reject(err);

          var ext = _path3.default.extname(_this3.path);
          for (var type in _mime2.default) {
            if (ext === type) {
              res.writeHead(200, { 'Content-Type': type + ';charset=utf8;' });
              break;
            }
          }
          resolve(data);
        });
      });
      return promise;
    }
  }, {
    key: 'dealPath',
    value: function dealPath(req, res) {
      var _this4 = this;

      //处理路径
      var promise = new Promise(function (resolve, reject) {
        _fs2.default.readdir(_this4.path, function (err, files) {
          if (err) return reject(err);

          var listr = '';
          for (var i = 0, len = files.length; i < len; i++) {
            var _path = _path3.default.relative(_this4.root, _path3.default.join(_this4.path, files[i]));
            listr += '<li><a href="/' + _path + '">' + files[i] + '</a></li>';
          }
          var str = '<ul><li><a href="./../">..</a></li>' + listr + '</ul>';
          res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8;' });
          resolve(str);
        });
      });
      return promise;
    }
  }]);

  return miniHttpServer;
}();

var miniHS = exports.miniHS = miniHttpServer;