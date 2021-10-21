import { newEngine } from '@treecg/actor-init-ldes-client';
import { State } from '../lib/EventStream';

describe('EventStream', () => {
    var LDESClient = newEngine();
    jest.setTimeout(10000);

    const memberCount = 764;
    let state: State;

    test('Test if all members are emitted', (done) => {
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

    test('Test if the pause event is emitted, when pause before data', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            
            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.pause();

            eventstreamSync.once('data', () => {
                // do nothing
            });

            eventstreamSync.on('pause', () => {
                // console.log(eventstreamSync.isPaused());
                mock();
                expect(mock).toHaveBeenCalled();
                done();
            });
            
        } catch (e) {
            done(e);
        }
    });

    test('Test if the pause event is emitted, when pause after data', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            
            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);

            eventstreamSync.once('data', () => {
                eventstreamSync.pause();
            });

            eventstreamSync.on('pause', () => {
                // console.log(eventstreamSync.isPaused());
                mock();
                expect(mock).toHaveBeenCalled();
                done();
            });
            
        } catch (e) {
            done(e);
        }
    });
    
    test('Test if you can pause the eventstream', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.once('data', () => {
                eventstreamSync.pause();
            });

            eventstreamSync.once('pause', () => {
                state = eventstreamSync.exportState();
                expect(state).toBeInstanceOf(Object);
                done();
            });

        } catch (e) {
            done(e);
        }
    });

    
    test('Test if you can load a state in the eventstream using constructor', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options, state);
            expect(eventstreamSync.exportState()).toStrictEqual(state);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can load a state in the eventstream', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.importState(state);
            expect(eventstreamSync.exportState()).toStrictEqual(state);
            done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can load a state in the eventstream using constructor', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let state = LDESClient.createReadStream(url, options).exportState();
            let eventstreamSync = LDESClient.createReadStream(url, options, state);

            const mock = jest.fn();
            const mockEnd = jest.fn();
            eventstreamSync.on('data', () => {mock()});
            
            eventstreamSync.once('end', () => {
                mockEnd();
                expect(mockEnd).toHaveBeenCalled();
                expect(mock).toHaveBeenCalledTimes(memberCount);
                done();
            });
            
            //done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can load a state in the eventstream using constructor', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mockEnd = jest.fn();
            
            eventstreamSync1.on('data', () => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', () => {mock2()});

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    console.log(mock1.mock.calls.length, mock2.mock.calls.length);
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    //expect(mock2).toHaveBeenCalledTimes(memberCount);
                    done();
                });
            });
            
            //done();
        } catch (e) {
            done(e);
        }
    });
    
    test('Test if you can load a state in the eventstream using constructor, representation Object', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Object",
                "disablePolling": true
            };
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mockEnd = jest.fn();
            
            eventstreamSync1.on('data', () => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', () => {mock2()});

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    console.log(mock1.mock.calls.length, mock2.mock.calls.length);
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    //expect(mock2).toHaveBeenCalledTimes(memberCount);
                    done();
                });
            });
            
            //done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can load a state in the eventstream using constructor, representation Quads', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mockEnd = jest.fn();
            
            eventstreamSync1.on('data', () => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', () => {mock2()});

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    console.log(mock1.mock.calls.length, mock2.mock.calls.length);
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    //expect(mock2).toHaveBeenCalledTimes(memberCount);
                    done();
                });
            });
            
            //done();
        } catch (e) {
            done(e);
        }
    });
    

    /*
    test('Test if paused eventStream does not lose events', (done) => {
        jest.setTimeout(20000);
        
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let count = 0;

            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                count++;
                if (count === 5) {
                    console.log('Pausing eventstream');
                    eventstreamSync.pause();
                }
                //done();
            });

            let eventstreamSync2;

            eventstreamSync.on('pause', () => {
                console.log('Eventstream is paused');
                let state = eventstreamSync.exportState();
                //eventstreamSync.destroy();
                
                eventstreamSync2 = LDESClient.createReadStream(url, options);
                eventstreamSync2.importState(state);
                //done();
            });

            eventstreamSync2.on('data', () => {
                //console.log('Received data');
                count++;
            });

            eventstreamSync2.once('end', () => {
                console.log('Received end event');
                console.log(count);
                expect(count).toBe(memberCount);
                done();
            });

            
            eventstreamSync.on('end', () => {
                console.log(count);
                expect(count).toBe(memberCount);
                //done();
            });
            
            
        } catch (e) {
            done(e);
        }

        

    });
    */


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
