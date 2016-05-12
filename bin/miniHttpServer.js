#!/usr/bin/env node

'use strict';
var program = require('commander');
var miniHS = require('../index.js');


var port = 0;
program
  .version('0.0.3')
  .usage('<keywords>')
  .option('-p, --port', 'set the server port.');

program.parse(process.argv);
if(!program.args.length){
  program.help();
}else{
  if(program.port){
    port = parseInt(program.args);
    new miniHS.miniHS(port).run();
  }
}