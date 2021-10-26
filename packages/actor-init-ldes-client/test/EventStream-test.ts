import { newEngine } from '@treecg/actor-init-ldes-client';

describe('EventStream', () => {
    var LDESClient = newEngine();
    jest.setTimeout(15000);

    const memberCount = 764;

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    test('Test if all members are emitted, representation Quads', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            
            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                mock();
            });

            eventstreamSync.on('end', () => {
                expect(mock).toHaveBeenCalledTimes(memberCount);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('Test if all members are emitted, representation Object', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Object",
                "disablePolling": true
            };
            
            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                mock();
            });

            eventstreamSync.on('end', () => {
                expect(mock).toHaveBeenCalledTimes(memberCount);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('Test if all members are emitted, mimeType text/turtle', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            
            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                mock();
            });

            eventstreamSync.on('end', () => {
                expect(mock).toHaveBeenCalledTimes(memberCount);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

});
