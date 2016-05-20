#!/usr/bin/env node

'use strict';
var program = require('commander');
var miniHS = require('../dist/mnhs.js');

console.log(miniHS);

var port = 0;
program
  .version('1.1.1')
  .usage('<keywords>')
  .option('-p, --port', 'set the server port.');

program.parse(process.argv);
if(!program.args.length){
  program.help();
}else{
  if(program.port){
    port = parseInt(program.args);
    new miniHS.runServer(port);
  }
}
