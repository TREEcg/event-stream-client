import { newEngine } from '@treecg/actor-init-ldes-client';
import { Quad } from "@rdfjs/types";



describe('LDESClient as a lib', () => {
    var LDESClient = newEngine();
    test('Stream should emit strings when configured that way', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "mimeType": "text/turtle"
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

    test('Stream should emit End event', (done) => {
        try {
            let url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
            let options = {
                "representation": "Object",
                "disablePolling": true
            };
            let LDESClient = newEngine();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('end', () => {
                expect(true).toEqual(true);
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
                "representation": "Quads"
            };
            let LDESClient = newEngine();
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
                "representation": "Object"
            };
            let LDESClient = newEngine();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (member) => {
                expect(member.object).toBeInstanceOf(Object);
                done();
            });
        } catch (e) {
            done(e);
        }
    });
});