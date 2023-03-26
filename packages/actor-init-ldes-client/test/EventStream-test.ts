import { newEngine } from '@treecg/actor-init-ldes-client';
import { State, OutputRepresentation } from '../lib/EventStream';

describe('EventStream', () => {
    const LDESClient = newEngine();
    const url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
    const memberCount = 2;

    test('Test if all members are emitted, representation Quads', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };

        const mock = jest.fn();
        LDESClient.createReadStream(url, options).on('data', () => {
            mock();
        }).on('end', () => {
            expect(mock).toHaveBeenCalledTimes(memberCount);
            done();
        });

    });

    test('Test if all members are emitted, representation Object', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };

        const mock = jest.fn();
        LDESClient.createReadStream(url, options).on('data', () => {
            mock();
        }).on('end', () => {
            expect(mock).toHaveBeenCalledTimes(memberCount);
            done();
        });

    });

    test('Test if all members are emitted, mimeType text/turtle', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };

        const mock = jest.fn();
        LDESClient.createReadStream(url, options).on('data', () => {
            mock();
        }).on('end', () => {
            expect(mock).toHaveBeenCalledTimes(memberCount);
            done();
        });

    });

    test('Test if the pause event is emitted, when pause after data', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };

        const mock = jest.fn();
        const stream = LDESClient.createReadStream(url, options);

        stream.once('data', () => {
            stream.pause();
        });

        stream.on('pause', () => {
            mock();
            expect(mock).toHaveBeenCalled();
            stream.destroy();
        }).on('close', done);
    });

    test('Test if you can export State of the EventStream', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        stream.once('data', () => {
            stream.pause();
        });

        stream.once('pause', () => {
            const state = stream.exportState();
            expect(state).toBeInstanceOf(Object);
            stream.destroy();
        }).on('close', done);
    });

    test('Test if you can export State of the EventStream in Quad mode', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        stream.once('data', () => {
            stream.pause();
        });

        stream.once('pause', () => {
            const state = stream.exportState();
            expect(state).toBeInstanceOf(Object);
            stream.destroy();
        }).on('close', done);
    });

    test('Test if you get an error when exporting the state of a running EventStream', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        expect(() => {
            stream.exportState()
        }).toThrowError('Cannot export state while stream is not paused or ended');
        done();
    });

    test('Test if you can export state after EventStream ended', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        stream.on('data', () => { })
            .on('end', () => {
                const state = stream.exportState();
                expect(state).toBeInstanceOf(Object);
                done();
            });
    });


    test('Test if you can load a state in the EventStream using constructor', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };

        const stream = LDESClient.createReadStream(url, options);
        stream.once('pause', () => {
            const state = stream.exportState();
            const stream2 = LDESClient.createReadStream(url, options, state);
            stream2.once('pause', () => {
                expect(stream2.exportState().bookkeeper.queue).toEqual(state.bookkeeper.queue);
                done();
            });
            stream2.pause();
            stream2.read();
        });
        stream.pause();
        stream.read();

    });

    test('Test if you can load a state in the EventStream, after data event', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        stream.once('data', () => {
            stream.pause();
        });

        stream.once('pause', () => {
            const state = stream.exportState();
            stream.importState(state);
            expect(stream.exportState().bookkeeper.queue).toStrictEqual(state.bookkeeper.queue);
            done();
        });
    });

    test('Test if you can load a state in the EventStream in Quad mode', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);

        stream.once('data', () => {
            stream.pause();
        });

        stream.once('pause', () => {
            const state = stream.exportState();
            stream.importState(state);
            expect(stream.exportState().bookkeeper.queue).toStrictEqual(state.bookkeeper.queue);
            done();
        });
    });

    test('Test if you can load a state in the EventStream using LDESClient constructor', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        const mock1 = jest.fn();
        const mock2 = jest.fn();
        const mockPaused = jest.fn();
        const mockEnd = jest.fn();

        stream1.on('data', () => {
            if (mock1.mock.calls.length === 1) {
                stream1.pause();
            }
            mock1();
            if (stream1.isPaused()) {
                mockPaused();
            }
        });

        stream1.once('pause', () => {
            state = stream1.exportState();

            const stream2 = newEngine().createReadStream(url, options, state);

            stream2.on('data', () => { mock2() })
                .on('end', () => {
                    mockEnd();
                    expect(mockPaused).toHaveBeenCalledTimes(0);
                    expect(mockEnd).toHaveBeenCalled();
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    done();
                });
        });
    });

    test('Test if you can load a state in the EventStream using constructor, representation Object', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        const mock1 = jest.fn();
        const mock2 = jest.fn();
        const mockEnd = jest.fn();

        stream1.on('data', () => {
            if (mock1.mock.calls.length === 1) {
                stream1.pause();
            }
            mock1();
        });

        stream1.once('pause', () => {
            state = stream1.exportState();

            const stream2 = LDESClient.createReadStream(url, options, state);
            stream2.on('data', () => { mock2() })
                .once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    done();
                });
        });
    });

    test('Test if you can load a state in the EventStream using constructor, representation Quads', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        const mock1 = jest.fn();
        const mock2 = jest.fn();
        const mockEnd = jest.fn();

        stream1.on('data', () => {
            if (mock1.mock.calls.length === 1) {
                stream1.pause();
            }
            mock1();
        });

        stream1.once('pause', () => {
            state = stream1.exportState();

            const stream2 = LDESClient.createReadStream(url, options, state);
            stream2.on('data', () => { mock2() })
                .once('end', () => {
                    mockEnd();
                    expect(mockEnd).toHaveBeenCalled();
                    expect(mock1.mock.calls.length + mock2.mock.calls.length).toBe(memberCount);
                    done();
                });
        });
    });

    test('Test if events are emitted using the right representation, representation Object', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        const mock1 = jest.fn();
        const mockEnd = jest.fn();

        stream1.on('data', (member) => {
            if (mock1.mock.calls.length === 1) {
                stream1.pause();
            }
            mock1();
            expect(member.object).toBeInstanceOf(Object);
        });

        stream1.once('pause', () => {
            state = stream1.exportState();

            const stream2 = LDESClient.createReadStream(url, options, state);

            stream2.on('data', (member) => {
                expect(member.object).toBeInstanceOf(Object);
            }).on('end', () => {
                mockEnd();
                expect(mockEnd).toHaveBeenCalled();
                done();
            });
        });
    });

    test('Test if you emitted events are the right representation, representation Quads', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        const mock1 = jest.fn();
        const mockEnd = jest.fn();

        stream1.on('data', (member) => {
            if (mock1.mock.calls.length === 1) {
                stream1.pause();
            }
            mock1();
            expect(member.quads).toBeInstanceOf(Array);
        });

        stream1.once('pause', () => {
            state = stream1.exportState();

            const stream2 = LDESClient.createReadStream(url, options, state);
            stream2.on('data', (member) => {
                expect(member.quads).toBeInstanceOf(Array);
            }).on('end', () => {
                mockEnd();
                expect(mockEnd).toHaveBeenCalled();
                done();
            });
        });
    });

    test('Test if event "synchronizing" is emitted when sync mode is enabled', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: false
        };

        const mock = jest.fn();
        const end = jest.fn();
        const syncing = jest.fn();
        const stream = LDESClient.createReadStream(url, options);

        stream.on('data', () => {
            mock();
        }).on('synchronizing', () => {
            syncing();
            expect(mock).toHaveBeenCalledTimes(memberCount);
            expect(syncing).toHaveBeenCalledTimes(1);
            expect(end).toHaveBeenCalledTimes(0);
            stream.destroy();
        }).on('close', done);
    });

    test('Test if event "synchronizing" is NOT emitted when disableSynchronization = true', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };

        const mock = jest.fn();
        const end = jest.fn();
        const syncing = jest.fn();
        const stream = LDESClient.createReadStream(url, options);
        stream.on('data', () => {
            mock();
        }).on('synchronizing', () => {
            syncing();
        }).on('end', () => {
            end();
            expect(mock).toHaveBeenCalledTimes(memberCount);
            expect(syncing).toHaveBeenCalledTimes(0);
            expect(end).toHaveBeenCalledTimes(1);
            done();
        });
    });

    test('Test if you can export state after "synchronizing" event', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: false
        };

        const mock = jest.fn();
        const stream = LDESClient.createReadStream(url, options);
        stream.on('data', () => {
            mock();
        }).on('synchronizing', () => {
            stream.pause();
        }).on('pause', () => {
            const state = stream.exportState();
            expect(state).toBeInstanceOf(Object);
            expect(mock).toHaveBeenCalledTimes(memberCount);
            done();
        });
    });

    test('Test if you can load a state with buffer in the EventStream using constructor, representation Quads', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };
        const stream1 = LDESClient.createReadStream(url, options);
        let state: State;

        setTimeout(() => {
            const mock = jest.fn();

            stream1.once('pause', () => {
                state = stream1.exportState();

                const stream2 = LDESClient.createReadStream(url, options, state);

                stream2.on('data', () => { mock() })
                    .on('end', () => {
                        expect(mock).toHaveBeenCalled();
                        done();
                    });
            });
            stream1.pause();
            stream1.read();
        }, 5000);
    });
});
