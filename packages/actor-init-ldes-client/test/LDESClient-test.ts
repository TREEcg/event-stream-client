import { Readable } from 'readable-stream';
import { ActorRdfParseN3 } from '@comunica/actor-rdf-parse-n3';
import { ActorRdfSerializeN3 } from '@comunica/actor-rdf-serialize-n3';
import { ActorRdfSerializeJsonLd } from '@comunica/actor-rdf-serialize-jsonld';
import { ActorRdfMetadataExtractTree } from '@treecg/actor-rdf-metadata-extract-tree';
import { ActorRdfFrameWithJSONLDjs } from '@treecg/actor-rdf-frame-with-json-ld-js';

import { ActorInit } from '@comunica/bus-init';
import { Bus, ActionContext } from '@comunica/core';
import { MediatorRace } from '@comunica/mediator-race';
import { LDESClient } from '../lib/LDESClient';
import { OutputRepresentation } from '../lib/EventStream';

describe('LDESClient', () => {
    let busInit: any;
    let busRdfMetadataExtractTree: any;
    let busRdfParse: any;
    let busRdfSerialize: any;
    let busRdfFrame: any;
    let mediatorRdfMetadataExtractTree: any;
    let mediatorRdfParseHandle: any;
    let mediatorRdfSerializeHandle: any;
    let mediatorRdfFrame: any;
    let input: Readable;

    beforeEach(() => {
        busInit = new Bus({ name: 'bus-init' })
        busRdfMetadataExtractTree = new Bus({ name: 'bus-RdfMetadataExtractTree' });
        busRdfParse = new Bus({ name: 'bus-RdfParse' });
        busRdfSerialize = new Bus({ name: 'bus-RdfSerialize' });
        busRdfFrame = new Bus({ name: 'bus-RdfFrame' });
        mediatorRdfMetadataExtractTree = new MediatorRace({ name: 'mediator', bus: busRdfMetadataExtractTree });
        mediatorRdfSerializeHandle = new MediatorRace({ name: 'mediator', bus: busRdfSerialize });
        mediatorRdfParseHandle = new MediatorRace({ name: 'mediator', bus: busRdfParse });
        mediatorRdfFrame = new MediatorRace({ name: 'mediator', bus: busRdfFrame });
        input = <any>{};
    });

    describe('The LDESClient module', () => {
        it('should be a function', () => {
            expect(LDESClient).toBeInstanceOf(Function);
        });

        it('should be a LDESClient constructor', () => {
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                pollingInterval: 1000
            })).toBeInstanceOf(LDESClient);
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                pollingInterval: 1000
            })).toBeInstanceOf(ActorInit);
        });

        it('should not be able to create new LDESClient objects without \'new\'', () => {
            expect(() => { (<any>LDESClient)(); }).toThrow();
        });

        it('should store the \'mediatorRdfMetadataExtractTree\' parameter', () => {
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                pollingInterval: 1000
            }).mediatorRdfMetadataExtractTree).toEqual(mediatorRdfMetadataExtractTree);
        });

        it('should store the \'mediatorRdfParseHandle\' parameter', () => {
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                pollingInterval: 1000
            }).mediatorRdfParseHandle).toEqual(mediatorRdfParseHandle);
        });
        it('should store the \'mediatorRdfFrame\' parameter', () => {
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                mediatorRdfFrame: mediatorRdfFrame,
                pollingInterval: 1000
            }).mediatorRdfFrame).toEqual(mediatorRdfFrame);
        });

        it('should store the \'pollingInterval\' parameter', () => {
            expect(new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                pollingInterval: 1000
            }).pollingInterval).toEqual(1000);
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
        let representation: OutputRepresentation;
        let processedURIsCount: number;

        beforeEach(() => {
            disableSynchronization = false;
            pollingInterval = 1000;
            processedURIsCount = 10000;
            mimeType = 'text/turtle';
            actor = new (<any>LDESClient)({
                name: 'actor',
                bus: busInit,
                mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree,
                mediatorRdfParseHandle,
                mediatorRdfSerializeHandle,
                mediatorRdfFrame: mediatorRdfFrame,
                pollingInterval: pollingInterval,
                mimeType: mimeType,
                processedURIsCount
            });
            rdfFrameActor = new (<any>ActorRdfFrameWithJSONLDjs)({
                mediatorRdfSerializeHandle,
                bus: busRdfFrame,
                name: 'actor-rdf-frame-with-json-ld-js'
            })
            busRdfParse.subscribe(new ActorRdfParseN3({
                bus: busRdfParse,
                mediaTypePriorities: {
                    'application/trig': 1,
                    'application/n-quads': 0.7,
                    'text/turtle': 0.6,
                    'application/n-triples': 0.3,
                    'text/n3': 0.2,
                },
                mediaTypeFormats: {
                    "application/n-quads": "http://www.w3.org/ns/formats/N-Quads",
                    "application/trig": "http://www.w3.org/ns/formats/TriG",
                    "application/n-triples": "http://www.w3.org/ns/formats/N-Triples",
                    "text/turtle": "http://www.w3.org/ns/formats/Turtle",
                    "text/n3": "http://www.w3.org/ns/formats/N3"
                },
                name: 'actor-rdf-parse-n3'
            }));
            busRdfMetadataExtractTree.subscribe(new ActorRdfMetadataExtractTree({
                bus: busRdfMetadataExtractTree,
                name: 'actor-rdf-metadata-extract-tree'
            }));
            busRdfSerialize.subscribe(new ActorRdfSerializeN3({
                bus: busRdfSerialize,
                name: 'actor-rdf-serialize-n3',
                mediaTypePriorities: {
                    'application/trig': 1,
                    'application/n-quads': 0.7,
                    'text/turtle': 0.6,
                    'application/n-triples': 0.3,
                    'text/n3': 0.2,
                },
                mediaTypeFormats: {
                    "application/n-quads": "http://www.w3.org/ns/formats/N-Quads",
                    "application/trig": "http://www.w3.org/ns/formats/TriG",
                    "application/n-triples": "http://www.w3.org/ns/formats/N-Triples",
                    "text/turtle": "http://www.w3.org/ns/formats/Turtle",
                    "text/n3": "http://www.w3.org/ns/formats/N3"
                },
            }));
            busRdfFrame.subscribe(rdfFrameActor);
            busRdfSerialize.subscribe(new ActorRdfSerializeJsonLd({
                bus: busRdfSerialize,
                name: 'actor-rdf-serialize-jsonld',
                mediaTypePriorities: {
                    'application/ld+json': 1
                },
                mediaTypeFormats: {
                    'application/ld+json': 'http://www.w3.org/ns/formats/JSON-LD'
                },
                jsonStringifyIndentSpaces: 2
            }));

            url = 'https://semiceu.github.io/LinkedDataEventStreams/example.ttl';
        });

        it('should test', () => {
            return expect(actor.test({ context: new ActionContext(), argv: [], env: {}, stdin: input })).resolves.toBe(true);
        });

        it('should run', () => {
            return expect(actor.run({ context: new ActionContext(), argv: [url], env: {}, stdin: input })).resolves
                .toHaveProperty('stdout');
        });

        describe('run', () => {
            it('should set the deprecated \'disablePolling\' property to the \'disableSynchronization\' property', async () => {
                const disablePolling = true;
                const spyCreateReadStream = jest.spyOn(actor, "createReadStream");
                let stdout = <any>(await actor.run({
                    context: new ActionContext(),
                    argv: ['--disablePolling', disablePolling.toString(), url],
                    env: {},
                    stdin: new Readable()
                })).stdout;
                expect(spyCreateReadStream.mock.calls[0][1]).toEqual({
                    "disableSynchronization": disablePolling,
                    "pollingInterval": 1000,
                    "processedURIsCount": 10000,
                    "mimeType": "text/turtle",
                    "disableFraming": undefined,
                    "dereferenceMembers": undefined,
                    "emitMemberOnce": undefined,
                    "fromTime": undefined,
                    "jsonLdContext": {
                        "@context": {}
                    },
                    "requestsPerMinute": undefined,
                    "loggingLevel": "info"
                });
            });

            it('should stop when disableSynchronization is true', async () => {
                disableSynchronization = true;
                let stdout = <any>(await actor.run({
                    context: new ActionContext(),
                    argv: ['--disableSynchronization', disableSynchronization.toString(), url],
                    env: {},
                    stdin: new Readable()
                })).stdout;

                for await (const data of stdout) { /*do nothing*/ }
            });

            it('should synchronize when disableSynchronization is false', (done) => {
                disableSynchronization = false;
                actor.run({
                    context: new ActionContext(),
                    argv: ['--disableSynchronization', disableSynchronization.toString(), url],
                    env: {},
                    stdin: new Readable()
                }).then(({ stdout }) => {
                    stdout?.on('data', () => { /*do nothing*/ })
                        .on('close', () => {
                            done();
                        });
                    // Terminate after 4s
                    setTimeout(() => {

                        stdout?.destroy();
                    }, 4000);
                });
            });

            it('should disable framing when mimeType is \'application/ld+json\'', (done) => {
                url = 'https://brechtvdv.github.io/demo-data/example.ttl';
                disableSynchronization = true;
                disableFraming = true;
                actor.run({
                    context: new ActionContext(),
                    argv: [
                        '--disableSynchronization', disableSynchronization.toString(),
                        '--mimeType', 'application/ld+json',
                        '--disableFraming', disableFraming.toString(), url
                    ],
                    env: {},
                    stdin: new Readable()
                }).then(({ stdout }) => {
                    stdout?.once('data', (data: any) => {
                        const result = JSON.parse(data);
                        // member has a versionOf property
                        const members = result.filter((r: any) => r["http://purl.org/dc/terms/isVersionOf"]);
                        const test = members[0]['http://purl.org/dc/terms/isVersionOf'][0]['@id'];
                        // Without framing, subjects have a separate entry
                        // There should be an entry for the non-versioned object
                        expect((result.filter((r: any) => r["@id"] === test)).length).toEqual(1);
                    }).on('end', done);
                });
            });
        });
    });
});
