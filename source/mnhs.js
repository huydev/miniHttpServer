import http from 'http';
import fs from 'fs';
import url from 'url';
import qs from 'querystring';
import path from 'path';
import mime from '../mime.json';

class miniHttpServer{
  constructor(port){
    this.path = '';
    this.port = port || 3000;
    this.root = '';
  }
  run(){
    http.createServer((req, res) => {
      if(req.url == '/favicon.ico'){
        return res.end('');
      }
      var urlOjb = url.parse(req.url);
      this.root = process.cwd();

      this.path = path.normalize( this.root + urlOjb.pathname );

      res.setHeader('Content-Type', 'text/plain;charset=utf8;');

      this.getStats().then((stats) => {
        if(stats.isFile()){
          this.dealFile(req, res).then((data) => {
            res.write(data);
            res.end();
          }).catch((err) =>{
            console.log('aaa' + err);
          });
        }else if(stats.isDirectory()){
          this.dealPath(req, res).then((data) => {
            res.write(data);
            res.end();
          }).catch((err) =>{
            console.log('bbb' + err);
          });
        }else{
          res.write('404');
          res.end();
        }
      }).catch((err) =>{
        console.log('ccc' + err);
      });
    }).listen(this.port, () => {
      console.log('server start at ' + this.port);
    });
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

export var miniHS = miniHttpServer;

// for test
//new miniHttpServer().run();