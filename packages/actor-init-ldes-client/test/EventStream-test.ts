import { newEngine } from '@treecg/actor-init-ldes-client';

describe('EventStream', () => {
    var LDESClient = newEngine();

    const memberCount = 764;

    test('Test if paused eventStream does not lose events', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling" : true
            };
            let count = 0;
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', (member) => {
                count++;
                if (count === 20) {
                    eventstreamSync.pause();
                }
            });

            eventstreamSync.once('pause', () => {
                const state = eventstreamSync.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options);
                eventstreamSync2.importState(state);

                eventstreamSync2.on('data', (member) => {
                    count++;
                });

                eventstreamSync2.on('end', () => {
                    expect(count).toBe(memberCount);
                    done();
                });
            });

        } catch (e) {
            done(e);
        }
    });

    test('Test if paused eventStream does not lose events', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling" : true
            };
            let count = 0;
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', (member) => {
                count++;
                if (count === 20) {
                    eventstreamSync.pause();
                }
            });

            eventstreamSync.once('pause', () => {
                const state = eventstreamSync.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options);
                eventstreamSync2.importState(state);

                eventstreamSync2.on('data', (member) => {
                    count++;
                });

                eventstreamSync2.on('end', () => {
                    expect(count).toBe(memberCount);
                    done();
                });
            });

        } catch (e) {
            done(e);
        }
    });
    
    test('Test ldes event size', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling" : true
            };
            let count = 0;
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', (member) => {
                count++;
                //done();
            });

            eventstreamSync.on('end', () => {
                console.log(count);
                expect(count).toBe(memberCount);
                done();
            });
        } catch (e) {
            done(e);
        }
    });
    

    /*
    test('EventStream should be searializable after pause', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling" : true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', (member) => {
                eventstreamSync.pause();
                done();
            });

            eventstreamSync.once('pause', () => {
                const state = eventstreamSync.exportState();
                console.log(state);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    
    test('EventStream should be searializable before start', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            const state = eventstreamSync.exportState();
            console.log(state);
            console.log(state.bookie);
            done();

        } catch (e) {
            done(e);
        }
    });
    */

    /*
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
    */
});
