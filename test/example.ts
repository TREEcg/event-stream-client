const Sync = require('../dist/sync.js').Sync;
const sync = new Sync();

var main = async function () {
    try {
        let url = "http://lodi.ilabt.imec.be/coghent/industriemuseum/objecten";
        let options = {
            "pollingInterval": 5000 // millis
        };
        let eventstreamSync = sync.createReadStream(url, options);
        eventstreamSync.on('data', (data: any) => {
            console.log(data)
        })
    } catch (e) {
        console.error(e);
    }
}

main();