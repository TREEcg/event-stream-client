import { newEngine } from '@treecg/actor-init-ldes-client';
import { Quad } from "@rdfjs/types";

describe('LDESClient as a lib', () => {
    var LDESClient = newEngine();
    test('Stream should emit strings when configured that way', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (data) => {
                expect(data).toBeDefined();
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('Stream should emit quads when configured that way', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "representation": "Quads",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (member) => {
                expect(member.quads).toBeInstanceOf(Array);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('Stream should emit Object when configured with Object', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "representation": "Object",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (member) => {
                expect(member.object).toBeInstanceOf(Object);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('The stream should end when done', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "representation": "Object",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            const mock = jest.fn();
            eventstreamSync.on("data", (member) => {
                //do nothing
            })
            eventstreamSync.on('end', () =>  {
                mock();
                done();
            });
            expect(mock).toHaveBeenCalled;
        } catch (e) {
            //done(e);
        }
    });

    test('Stream should emit metadata', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "representation": "Object",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('metadata', (metadata) => {
                expect(metadata).toBeInstanceOf(Object);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    it('should disable framing with representation \'Object\'', async (done) => {
        try {
            let url = 'https://brechtvdv.github.io/demo-data/example.ttl';
            let options = {
                "representation": "Object",
                "disableFraming" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (data) => {
                try {
                    const result = data.object;
                    const members = result.filter((r: any) => r["http://purl.org/dc/terms/isVersionOf"]); // member has a versionOf property
                    const test = members[0]['http://purl.org/dc/terms/isVersionOf'][0]['@id'];
                    // Without framing, subjects have a separate entry
                    // There should be an entry for the non-versioned object
                    expect((result.filter((r: any) => r["@id"] === test)).length).toEqual(1);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        } catch (e) {
            done(e);
        }
    });
});
