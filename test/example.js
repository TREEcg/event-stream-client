const sync = require('../lib/sync.js');

var main = async function () {
    try {
        let url = "http://lodi.ilabt.imec.be/coghent/objecten";
        let options = {
            "pollingInterval": 5000 // millis
        };
        let eventstreamSync = sync.createReadStream(url, options);
        eventstreamSync.on('data', (data) => {
            console.log(data)
        })
    } catch (e) {
        console.error(e);
    }
}

main();