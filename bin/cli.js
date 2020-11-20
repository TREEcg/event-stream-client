#!/usr/bin/env node
let sync = require('../lib/sync.js');

let program = require('commander');
console.error('TREE sync. Use --help to discover more instructions');

let url = "";

let list = function (val) {
    return val.split(',');
}

program
    .arguments('<url>')
    .action(function (argUrl) {
        url = argUrl;
    })
    .parse(process.argv);

if (!process.argv[0]) {
    console.error('Provide a URI of a TREE root node please');
    process.exit();
}

url = process.argv[0];

let syncOptions = {
    "url": "http://localhost:3000/objecten",
    "pollingInterval": 10000 // millis
};

// Create readable stream
let eventstreamSync = sync.createReadStream(syncOptions);

// Pipe it to stdout
eventstreamSync.pipe(process.stdout);