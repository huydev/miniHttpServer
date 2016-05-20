import http from 'http';
import fs from 'fs';
import url from 'url';
import qs from 'querystring';
import path from 'path';
import mime from '../mime.json';

class miniHttpServer{
  constructor(port){
    this.path = '';
    this.root = '';
  }

  getStats(){
    let promise = new Promise((resolve, reject) => {
      fs.stat(this.path, (err, stats) => {
        if(err) return reject(err);
        resolve(stats);
      });
    });
    return promise;
  }
  dealFile(req, res){ //处理文件
    let promise = new Promise((resolve, reject) => {
      fs.readFile(this.path, (err, data) => {
        if(err) return reject(err);

        console.log('request: ' + this.path);

        let ext = path.extname(this.path);
        for(let type in mime){
          if(ext === '.' + type){
            res.writeHead(200, {'Content-Type' : mime[type] + ';charset=utf8;'});
            break;
          }
        }
        resolve(data);
      });
    });
    return promise;
  }
  dealPath(req, res){ //处理路径
    let promise = new Promise((resolve, reject) => {
      fs.readdir(this.path, (err, files) => {
        if(err) return reject(err);

        var listr = '';
        for(var i=0, len=files.length; i<len; i++){
          var _path = path.relative(this.root, path.join(this.path, files[i]));
          listr += '<li><a href="/'+ _path + '">' + files[i] + '</a></li>';
        }
        var str = '<ul><li><a href="./../">..</a></li>' + listr + '</ul>';
        res.writeHead(200, {'Content-Type' : 'text/html;charset=utf8;'});
        resolve(str);
      });
    });
    return promise;
  }
}

function startServer(port){
  var port = port || 3000;
  http.createServer((req, res) => {
    if(req.url == '/favicon.ico'){
      return res.end('');
    }
    var _this = new miniHttpServer();
    var urlOjb = url.parse(req.url);
    _this.root = process.cwd();

    _this.path = path.normalize( _this.root + urlOjb.pathname );

    res.setHeader('Content-Type', 'text/plain;charset=utf8;');

    _this.getStats().then((stats) => {
      if(stats.isFile()){
        _this.dealFile(req, res).then((data) => {
          res.write(data);
          res.end();
        }).catch((err) =>{
          console.log('readFile: ' + err);
        });
      }else if(stats.isDirectory()){
        _this.dealPath(req, res).then((data) => {
          res.write(data);
          res.end();
        }).catch((err) =>{
          console.log('readDir: ' + err);
        });
      }else{
        res.write('404');
        res.end();
      }
    }).catch((err) =>{
      console.log('system Error: ' + err);
    });
  }).listen(port, () => {
    console.log('server start at ' + port);
  });
}
// for test
//startServer();

export var runServer = startServer;


