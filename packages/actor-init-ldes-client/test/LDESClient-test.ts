import { PassThrough, Readable } from 'stream';
import { ActorRdfParseN3 } from '@comunica/actor-rdf-parse-n3';
import { ActorRdfSerializeN3 } from '@comunica/actor-rdf-serialize-n3';
import { ActorRdfMetadataExtractTree } from '@treecg/actor-rdf-metadata-extract-tree';

import { ActorInit } from '@comunica/bus-init';
import { Bus } from '@comunica/core';
import { MediatorRace } from '@comunica/mediator-race';
import { LDESClient } from '../lib/LDESClient';

describe('LDESClient', () => {
    let busInit: any;
    let busRdfMetadataExtractTree: any;
    let busRdfParse: any;
    let busRdfSerialize: any;
    let mediatorRdfMetadataExtractTree: any;
    let mediatorRdfParse: any;
    let mediatorRdfSerialize: any;
    let input: Readable;

    beforeEach(() => {
        busInit = new Bus({name: 'bus-init'})
        busRdfMetadataExtractTree = new Bus({ name: 'bus-RdfMetadataExtractTree' });
        busRdfParse = new Bus({ name: 'bus-RdfParse' });
        busRdfSerialize = new Bus({name: 'bus-RdfSerialize'});
        mediatorRdfMetadataExtractTree = new MediatorRace({ name: 'mediator', bus: busRdfMetadataExtractTree });
        mediatorRdfSerialize = new MediatorRace({name: 'mediator', bus: busRdfSerialize});
        mediatorRdfParse = new MediatorRace({ name: 'mediator', bus: busRdfParse });
        input = <any> {};
    });

    describe('The LDESClient module', () => {
        it('should be a function', () => {
            expect(LDESClient).toBeInstanceOf(Function);
        });

        it('should be a LDESClient constructor', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 }))
                .toBeInstanceOf(LDESClient);
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 }))
                .toBeInstanceOf(ActorInit);
        });

        it('should not be able to create new LDESClient objects without \'new\'', () => {
            expect(() => { (<any> LDESClient)(); }).toThrow();
        });

        it('should store the \'mediatorRdfMetadataExtractTree\' parameter', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .mediatorRdfMetadataExtractTree).toEqual(mediatorRdfMetadataExtractTree);
        });

        it('should store the \'mediatorRdfParse\' parameter', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .mediatorRdfParse).toEqual(mediatorRdfParse);
        });

        it('should store the \'pollingInterval\' parameter', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .pollingInterval).toEqual(1000);
        });
    });

    describe('An LDESClient instance', () => {
        let actor: LDESClient;
        let url: string;
        let disablePolling: boolean;
        let disableSynchronization: boolean;
        let mimeType: string;
        let pollingInterval: number;

        beforeEach(() => {
            disableSynchronization = false;
            pollingInterval = 1000;
            mimeType = 'text/turtle';
            actor = new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParse: mediatorRdfParse,
                mediatorRdfSerialize: mediatorRdfSerialize,
                pollingInterval: pollingInterval,
                mimeType: mimeType
            });
            busRdfParse.subscribe(new ActorRdfParseN3({
                bus: busRdfParse,
                mediaTypes: {
                    'application/trig': 1,
                    'application/n-quads': 0.7,
                    'text/turtle': 0.6,
                    'application/n-triples': 0.3,
                    'text/n3': 0.2,
                },
                name: 'actor-rdf-parse-n3'
            }));
            busRdfMetadataExtractTree.subscribe(new ActorRdfMetadataExtractTree({
                bus: busRdfMetadataExtractTree,
                name: 'actor-rdf-metadata-extract-tree'
            }));
            busRdfSerialize.subscribe(new ActorRdfSerializeN3({bus: busRdfSerialize, name: 'actor-rdf-serialize-n3', mediaTypes: {
                'application/trig': 1,
                'application/n-quads': 0.7,
                'text/turtle': 0.6,
                'application/n-triples': 0.3,
                'text/n3': 0.2,
            }}));

            url = 'https://semiceu.github.io/LinkedDataEventStreams/example.ttl';
        });

        it('should test', () => {
            return expect(actor.test({ argv: [], env: {}, stdin: input })).resolves.toBe(true);
        });

        it('should run', () => {
            return expect(actor.run({ argv: [ url ], env: {}, stdin: input })).resolves
                .toHaveProperty('stdout');
        });

        describe('run', () => {
            it('should set the deprecated \'disablePolling\' property to the \'disableSynchronization\' property', async (done) => {
                try {
                    const disablePolling = true;
                    const spyCreateReadStream = jest.spyOn(actor, "createReadStream");
                    let stdout = <any> (await actor.run({
                        argv: ['--disablePolling', disablePolling.toString(), url],
                        env: {},
                        stdin: new PassThrough()
                    })).stdout;
                    expect(spyCreateReadStream.mock.calls[0][1]).toEqual({
                        "disableSynchronization": disablePolling,
                        "pollingInterval": 1000,
                        "mimeType": "text/turtle",
                        "dereferenceMembers": undefined,
                        "emitMemberOnce": undefined,
                        "fromTime": undefined,
                        "jsonLdContext": {
                            "@context": {}
                        },
                        "requestsPerMinute": undefined,
                        "loggingLevel": "info"
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });

            it('should stop when disableSynchronization is enabled', async (done) => {
                try {
                    disableSynchronization = true;
                    let stdout = <any> (await actor.run({
                        argv: ['--disableSynchronization', disableSynchronization.toString(), url],
                        env: {},
                        stdin: new PassThrough()
                    })).stdout;

                    stdout.on('data', () => {
                        // do nothing
                    });
                    stdout.on('end', () => {
                        done();
                    });
                } catch (e) {
                    done(e);
                }
            });
            it('should synchronize when disableSynchronization is disabled', async (done) => {
                try {
                    disableSynchronization = false;
                    let stdout = <any> (await actor.run({
                        argv: ['--disableSynchronization', disableSynchronization.toString(), url],
                        env: {},
                        stdin: new PassThrough()
                    })).stdout;

                    stdout.on('data', () => {
                        // do nothing
                    });
                    stdout.on('end', () => {
                        // Should not end
                        throw Error("Should not end");
                    });
                    // Success when not stopped after 4s
                    setTimeout(() => {
                        done();
                    }, 4000)
                } catch (e) {
                    done(e);
                }
            });
        });
    });
});
