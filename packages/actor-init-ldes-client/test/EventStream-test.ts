import { newEngine } from '@treecg/actor-init-ldes-client';
import { State } from '../lib/EventStream';

describe('EventStream', () => {
    var LDESClient = newEngine();
    jest.setTimeout(15000);

    const memberCount = 764;
    let state: State;

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

    test('Test if you can export State of the eventstream', (done) => {
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

    test('Test if you get an error when exporting the state of a running eventstream', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventStreamStync = LDESClient.createReadStream(url, options);
            expect(() => {
                eventStreamStync.exportState()
            }).toThrowError('Cannot export state while stream is not paused or ended');
            done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can export state after EventStream ended', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "mimeType": "text/turtle",
                "disablePolling": true
            };
            let eventStreamStync = LDESClient.createReadStream(url, options);
            eventStreamStync.on('data', () => {});
            eventStreamStync.on('end', () => {
                state = eventStreamStync.exportState();
                expect(state).toBeInstanceOf(Object);
                done();
            });
        } catch (e) {
            done(e);
        }
    });


    // test('Test if you can load a state in the eventstream using constructor', (done) => {
    //     try {
    //         let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
    //         let options = {
    //             "mimeType": "text/turtle",
    //             "disablePolling": true
    //         };
    //         // let state = LDESClient.createReadStream(url, options).exportState();
    //         // let eventstreamSync = LDESClient.createReadStream(url, options, state);
    //         // expect(eventstreamSync.exportState()).toStrictEqual(state);
    //         // done();
    //         let eventstreamSync = LDESClient.createReadStream(url, options);
    //         eventstreamSync.pause();
    //         eventstreamSync.once('pause', () => {
    //             let state = eventstreamSync.exportState();
    //             let eventstreamSync2 = LDESClient.createReadStream(url, options, state);
    //             eventstreamSync2.pause();
    //             eventstreamSync2.once('pause', () => {
    //                 expect(eventstreamSync2.exportState()).toEqual(state);
    //                 done();
    //             });
    //         });
    //     } catch (e) {
    //         done(e);
    //     }
    // });

    test('Test if you can load a state in the eventstream, after data event', (done) => {
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
                eventstreamSync.pause();
                let state = eventstreamSync.exportState();
                eventstreamSync.importState(state);
                expect(eventstreamSync.exportState()).toStrictEqual(state);
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
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const mockPaused = jest.fn();
            const mockEnd = jest.fn();

            eventstreamSync1.on('data', () => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
                if (eventstreamSync1.isPaused()) {
                    mockPaused();
                }
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();
                //console.log(state);

                let eventstreamSync2 = newEngine().createReadStream(url, options, state);
                //console.log(eventstreamSync2.exportState());

                eventstreamSync2.on('data', () => { mock2() });

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockPaused).toHaveBeenCalledTimes(0);
                    expect(mockEnd).toHaveBeenCalled();
                    // console.log(mock1.mock.calls.length, mock2.mock.calls.length);
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
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
                // console.log(state);

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', () => { mock2() });

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    // console.log(mock1.mock.calls.length, mock2.mock.calls.length);
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

            eventstreamSync1.once('pause', async () => {
                //await sleep(3000);
                state = eventstreamSync1.exportState();
                // console.log(state);

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', () => { mock2() });

                eventstreamSync2.once('end', () => {
                    // console.log(eventstreamSync1.exportState());
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    //console.log(eventstreamSync2.exportState());
                    //console.log(mock1.mock.calls.length, mock2.mock.calls.length);
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

    test('Test if you emitted events are the right representation, representation Object', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Object",
                "disablePolling": true
            };
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mockEnd = jest.fn();

            eventstreamSync1.on('data', (member) => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
                expect(member.object).toBeInstanceOf(Object);
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', (member) => {
                    expect(member.object).toBeInstanceOf(Object);
                });

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    done();
                });
            });

            //done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if you emitted events are the right representation, representation Quads', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": true
            };
            let eventstreamSync1 = LDESClient.createReadStream(url, options);
            let state: State;

            const mock1 = jest.fn();
            const mockEnd = jest.fn();

            eventstreamSync1.on('data', (member) => {
                if (mock1.mock.calls.length === 1) {
                    eventstreamSync1.pause();
                }
                mock1();
                expect(member.quads).toBeInstanceOf(Array);
            });

            eventstreamSync1.once('pause', () => {
                state = eventstreamSync1.exportState();

                let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

                eventstreamSync2.on('data', (member) => {
                    expect(member.quads).toBeInstanceOf(Array);
                });

                eventstreamSync2.once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    done();
                });
            });

            //done();
        } catch (e) {
            done(e);
        }
    });

    test('Test if all event "now only syncing" is emitted', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": false
            };

            const mock = jest.fn();
            const end = jest.fn();
            const syncing = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                mock();
            });

            eventstreamSync.on('now only syncing', () => {
                syncing();
                expect(mock).toHaveBeenCalledTimes(memberCount);
                expect(syncing).toHaveBeenCalledTimes(1);
                expect(end).toHaveBeenCalledTimes(0);
                done();
            });

            eventstreamSync.on('end', () => {
                end();
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    test('Test if you can export state after "now only syncing" event in polling mode', (done) => {
        try {
            let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
            let options = {
                "representation": "Quads",
                "disablePolling": false
            };

            const mock = jest.fn();
            let eventstreamSync = LDESClient.createReadStream(url, options);
            eventstreamSync.on('data', () => {
                mock();
            });

            eventstreamSync.on('now only syncing', () => {
                eventstreamSync.pause();
            });

            eventstreamSync.on('pause', () => {
                let state = eventstreamSync.exportState();
                // console.log(state);
                expect(mock).toHaveBeenCalledTimes(memberCount);
                done();
            });
        } catch (e) {
            done(e);
        }
    });

    // test('Test if you can load a state with buffer in the eventstream using constructor, representation Quads', async (done) => {
    //     try {
    //         let url = "https://smartdata.dev-vlaanderen.be/base/gemeente";
    //         let options = {
    //             "representation": "Quads",
    //             "disablePolling": true
    //         };
    //         let eventstreamSync1 = LDESClient.createReadStream(url, options);
    //         let state: State;

    //         const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    //         await delay(5000);

    //         const mock1 = jest.fn();
    //         const mock2 = jest.fn();
    //         const mockEnd = jest.fn();

    //         eventstreamSync1.pause();

    //         eventstreamSync1.once('data', () => {});

    //         eventstreamSync1.once('pause', () => {
    //             state = eventstreamSync1.exportState();
    //             console.log(state);

    //             let eventstreamSync2 = LDESClient.createReadStream(url, options, state);

    //             eventstreamSync2.on('data', () => {mock2()});

    //             eventstreamSync2.once('end', () => {
    //                 mockEnd();
    //                 expect(mockEnd).toHaveBeenCalled();
    //                 console.log(mock1.mock.calls.length, mock2.mock.calls.length);
    //                 expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
    //                 //expect(mock2).toHaveBeenCalledTimes(memberCount);
    //                 done();
    //             });
    //         });

    //         //done();
    //     } catch (e) {
    //         done(e);
    //     }
    // });

});
