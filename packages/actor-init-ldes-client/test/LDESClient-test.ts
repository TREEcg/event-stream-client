import { PassThrough, Readable } from 'stream';
import { ActorRdfParseN3 } from '@comunica/actor-rdf-parse-n3';
import { ActorRdfSerializeN3 } from '@comunica/actor-rdf-serialize-n3';
import { ActorRdfSerializeJsonLd } from '@comunica/actor-rdf-serialize-jsonld';
import { ActorRdfMetadataExtractTree } from '@treecg/actor-rdf-metadata-extract-tree';
import { ActorRdfFrameWithJSONLDjs } from '@treecg/actor-rdf-frame-with-json-ld-js';

import { ActorInit } from '@comunica/bus-init';
import { Bus } from '@comunica/core';
import { MediatorRace } from '@comunica/mediator-race';
import { LDESClient } from '../lib/LDESClient';

describe('LDESClient', () => {
    let busInit: any;
    let busRdfMetadataExtractTree: any;
    let busRdfParse: any;
    let busRdfSerialize: any;
    let busRdfFrame: any;
    let mediatorRdfMetadataExtractTree: any;
    let mediatorRdfParse: any;
    let mediatorRdfSerialize: any;
    let mediatorRdfFrame: any;
    let input: Readable;

    beforeEach(() => {
        busInit = new Bus({name: 'bus-init'})
        busRdfMetadataExtractTree = new Bus({ name: 'bus-RdfMetadataExtractTree' });
        busRdfParse = new Bus({ name: 'bus-RdfParse' });
        busRdfSerialize = new Bus({name: 'bus-RdfSerialize'});
        busRdfFrame = new Bus({name: 'bus-RdfFrame'});
        mediatorRdfMetadataExtractTree = new MediatorRace({ name: 'mediator', bus: busRdfMetadataExtractTree });
        mediatorRdfSerialize = new MediatorRace({name: 'mediator', bus: busRdfSerialize});
        mediatorRdfParse = new MediatorRace({ name: 'mediator', bus: busRdfParse });
        mediatorRdfFrame = new MediatorRace({ name: 'mediator', bus: busRdfFrame });
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
        it('should store the \'mediatorRdfFrame\' parameter', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, mediatorRdfFrame: mediatorRdfFrame, pollingInterval: 1000 })
                .mediatorRdfFrame).toEqual(mediatorRdfFrame);
        });

        it('should store the \'pollingInterval\' parameter', () => {
            expect(new (<any> LDESClient)({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .pollingInterval).toEqual(1000);
        });
    });

    describe('An LDESClient instance', () => {
        let actor: LDESClient;
        let rdfFrameActor: ActorRdfFrameWithJSONLDjs;
        let url: string;
        let disablePolling: boolean;
        let disableSynchronization: boolean;
        let mimeType: string;
        let pollingInterval: number;
        let disableFraming: boolean;
        let representation: string;

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
                mediatorRdfFrame: mediatorRdfFrame,
                pollingInterval: pollingInterval,
                mimeType: mimeType
            });
            rdfFrameActor = new (<any>ActorRdfFrameWithJSONLDjs)({
                mediatorRdfSerialize: mediatorRdfSerialize,
                bus: busRdfFrame,
                name: 'actor-rdf-frame-with-json-ld-js'
            })
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
            busRdfFrame.subscribe(rdfFrameActor);
            busRdfSerialize.subscribe(new ActorRdfSerializeJsonLd({bus: busRdfSerialize, name: 'actor-rdf-serialize-jsonld', mediaTypes: {
                'application/ld+json': 1
            }, jsonStringifyIndentSpaces: 2 }));

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
            it('should disable framing when mimeType is \'application/ld+json\'', async (done) => {
                try {
                    url = 'https://brechtvdv.github.io/demo-data/example.ttl';
                    disableFraming = true;
                    let stdout = <any> (await actor.run({
                        argv: ['--mimeType', 'application/ld+json', '--disableFraming', disableFraming.toString(), url],
                        env: {},
                        stdin: new PassThrough()
                    })).stdout;

                    stdout.once('data', (data: any) => {
                        try {
                            const result = JSON.parse(data);
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
    });
});
