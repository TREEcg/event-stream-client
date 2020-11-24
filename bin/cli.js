#!/usr/bin/env node
let sync = require('../lib/sync.js');

let program = require('commander');
console.error('TREE sync. Use --help to discover more instructions');

let url = "";

program
    .option('-p, --pollingInterval <milliseconds>', 'Number of milliseconds before refetching uncacheable fragments', 10000) // Default: 10 seconds
    .arguments('<url>')
    .action(function (argUrl) {
        url = argUrl;
    })
    .parse(process.argv);

if (!url || url === "") {
    console.error('Provide a URI of a TREE root node please');
    process.exit();
}

try {
    let options = {
        "pollingInterval": parseInt(program.pollingInterval)
    };

    // Create readable stream
    let eventstreamSync = sync.createReadStream(url, options);

    // Pipe it to stdout
    eventstreamSync.pipe(process.stdout);
} catch (e) {
    console.error(e);
    process.exit();
}