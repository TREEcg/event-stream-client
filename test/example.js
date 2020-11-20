let sync = require('../lib/sync.js');
let treesync = new sync();

let eventstream = "http://localhost:3000/objecten";

var main = async function () {
    try {
        let syncOptions = {
            "url": "http://localhost:3000/objecten",
            "pollingInterval": 5000 // millis
        };
        let eventstreamSync = sync.createReadStream(syncOptions);
    } catch (e) {
        console.error(e);
    }
}

main();