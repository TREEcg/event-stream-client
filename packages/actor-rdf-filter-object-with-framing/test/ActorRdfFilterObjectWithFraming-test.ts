import { Readable } from 'readable-stream';
import { DataFactory } from 'rdf-data-factory';
import { ActionContext, Bus } from '@comunica/core';
import { MediatorRace } from '@comunica/mediator-race';
import { ActorRdfSerializeJsonLd } from '@comunica/actor-rdf-serialize-jsonld';
import { ActorRdfParseJsonLd } from '@comunica/actor-rdf-parse-jsonld';
import { ActorRdfFilterObjectWithFraming } from '../lib/ActorRdfFilterObjectWithFraming';
import { ActorRdfFrameWithJSONLDjs } from '@treecg/actor-rdf-frame-with-json-ld-js';
import { Quad } from '@rdfjs/types';

describe('ActorRdfFilterObjectRdfFilterObjectWithFraming', () => {
  let busInit: any;
  let busRdfSerialize: any;
  let busRdfFrame: any;
  let busRdfParse: any;
  let mediatorRdfSerializeHandle: any;
  let mediatorRdfFrame: any;
  let mediatorRdfParseHandle: any;

  beforeEach(() => {
    busInit = new Bus({ name: 'bus-init' });
    busRdfSerialize = new Bus({ name: 'bus-RdfSerialize' });
    busRdfFrame = new Bus({ name: 'bus-RdfFrame' });
    busRdfParse = new Bus({ name: 'bus-RdfParse' });
    mediatorRdfSerializeHandle = new MediatorRace({ name: 'mediator', bus: busRdfSerialize });
    mediatorRdfFrame = new MediatorRace({ name: 'mediator', bus: busRdfFrame });
    mediatorRdfParseHandle = new MediatorRace({ name: 'mediator', bus: busRdfParse });
  });

  describe('An ActorRdfFilterObjectWithFraming instance', () => {
    let actor: ActorRdfFilterObjectWithFraming;
    let serializeActor: ActorRdfSerializeJsonLd;
    let parseActor: ActorRdfParseJsonLd;
    let frameActor: ActorRdfFrameWithJSONLDjs;
    let input: Readable;

    beforeEach(() => {
      // Define needed actors
      actor = new ActorRdfFilterObjectWithFraming({
        name: 'actor',
        bus: busInit,
        mediatorRdfFrame,
        mediatorRdfParseHandle
      });
      serializeActor = new ActorRdfSerializeJsonLd({
        name: 'actor-rdf-serialize-jsonld',
        bus: busRdfSerialize,
        mediaTypePriorities: { 'application/ld+json': 1 },
        mediaTypeFormats: { 'application/ld+json': 'http://www.w3.org/ns/formats/JSON-LD' },
        jsonStringifyIndentSpaces: 2
      });
      parseActor = new ActorRdfParseJsonLd({
        name: 'actor-rdf-parse-jsonld',
        bus: busRdfParse,
        mediaTypePriorities: { 'application/ld+json': 1 },
        mediaTypeFormats: { 'application/ld+json': 'http://www.w3.org/ns/formats/JSON-LD' },
        mediatorHttp: new MediatorRace({ name: 'mediator', bus: new Bus({ name: 'busHttp' }) })
      });
      frameActor = new (<any>ActorRdfFrameWithJSONLDjs)({
        name: 'actor-rdf-frame-with-json-ld-js',
        mediatorRdfSerializeHandle,
        bus: busRdfFrame
      });
      // Subscribe actors to respective buses
      busRdfSerialize.subscribe(serializeActor);
      busRdfFrame.subscribe(frameActor);

      // Initialize input stream
      input = new Readable({
        objectMode: true,
        read() { } 
      });
    });

    it('should test', () => {
      return expect(actor.test({
        context: new ActionContext(),
        objectURIs: [],
        data: new Readable(),
      })).resolves.toEqual(true); // TODO
    });

    it('should run', (done) => {
      const factory = new DataFactory();

      actor.run({
        context: new ActionContext(),
        objectURIs: ['http://example.org/1'],
        data: input,
      }).then((output) => {
        const filtered: Quad[] = [];
        output.data.get('http://example.org/1')?.on('data', quad => filtered.push(quad))
          .on('end', () => {
            expect(filtered).toHaveLength(1);
            done();
          });
      });

      // Push some test data
      input.push(factory.quad(
        factory.namedNode('http://example.org/2'),
        factory.namedNode('http://example.org/ns/type'),
        factory.namedNode('http://example.org/ns/FakeType')
      ));
      input.push(factory.quad(
        factory.namedNode('http://example.org/1'),
        factory.namedNode('http://example.org/ns/label'),
        factory.literal('Fake Label')
      ));
      input.push(null);
    });
  });
});
