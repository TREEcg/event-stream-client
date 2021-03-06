import type { Readable } from 'stream';
import { ActorRdfParseN3 } from '@comunica/actor-rdf-parse-n3';
import { ActorInit } from '@comunica/bus-init';
import { Bus } from '@comunica/core';
import { MediatorRace } from '@comunica/mediator-race';
import { LDESClient } from '../lib/LDESClient';
const arrayifyStream = require('arrayify-stream');
const stringToStream = require('streamify-string');

describe('LDESClient', () => {
    let bus: any;
    let busInit: any;
    let busRdfMetadataExtractTree: any;
    let busRdfParse: any;
    let mediatorRdfMetadataExtractTree: any;
    let mediatorRdfParse: any;

    beforeEach(() => {
        busInit = new Bus({name: 'bus-init'})
        busRdfMetadataExtractTree = new Bus({ name: 'bus-RdfMetadataExtractTree' });
        busRdfParse = new Bus({ name: 'bus-RdfParse' });
        mediatorRdfMetadataExtractTree = new MediatorRace({ name: 'mediator', bus: busRdfMetadataExtractTree });
        mediatorRdfParse = new MediatorRace({ name: 'mediator', bus: busRdfParse });
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
            expect(new LDESClient({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .mediatorRdfMetadataExtractTree).toEqual(mediatorRdfMetadataExtractTree);
        });

        it('should store the \'mediatorRdfParse\' parameter', () => {
            expect(new LDESClient({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .mediatorRdfParse).toEqual(mediatorRdfParse);
        });

        it('should store the \'pollingInterval\' parameter', () => {
            expect(new LDESClient({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 })
                .pollingInterval).toEqual(1000);
        });
    });

    describe('An LDESClient instance', () => {
        let actor: LDESClient;
        let url: string;
        let input: Readable;

        beforeEach(() => {
            actor = new LDESClient({ name: 'actor', bus: busInit, mediatorRdfMetadataExtractTree: mediatorRdfMetadataExtractTree, mediatorRdfParse: mediatorRdfParse, pollingInterval: 1000 });
            busRdfParse.subscribe(new ActorRdfParseN3({ bus: busRdfParse,
                mediaTypes: {
                    'application/trig': 1,
                    'application/n-quads': 0.7,
                    'text/turtle': 0.6,
                    'application/n-triples': 0.3,
                    'text/n3': 0.2,
                },
                name: 'actor-rdf-parse' }));
                url: 'https://lodi.ilabt.imec.be/coghent/dmg/objecten';
                input = stringToStream(``);
      //       input = stringToStream(`
      // <a> <b> <c>.
      // <d> <e> <f> <g>.
      // `);
            });

        it('should test', () => {
            return expect(actor.test({ argv: [], env: {}, stdin: input })).resolves.toBe(true);
        });

        it('should run', () => {
            return expect(actor.run({ argv: [ url ], env: {}, stdin: input })).resolves
                .toHaveProperty('stdout');
        });

        it('should run without argv', () => {
            return expect(actor.run({ argv: [], env: {}, stdin: input })).resolves
                .toHaveProperty('stdout');
        });

        it('should run with valid output', () => {
            return actor.run({ argv: [ 'text/turtle' ], env: {}, stdin: input })
                .then(async output => {
                    return expect(await arrayifyStream(output.stdout)).toBeTruthy();
                });
        });

        it('should run with two params', () => {
            return actor.run({ argv: [ 'text/turtle', 'x:' ], env: {}, stdin: input })
                .then(async output => {
                    return expect((await arrayifyStream(output.stdout)).map((b: any) => JSON.parse(b.toString()))).toEqual([
                        { subject: 'x:a', predicate: 'x:b', object: 'x:c', graph: '' },
                        { subject: 'x:d', predicate: 'x:e', object: 'x:f', graph: 'x:g' },
                    ]);
                });
        });
    });
});