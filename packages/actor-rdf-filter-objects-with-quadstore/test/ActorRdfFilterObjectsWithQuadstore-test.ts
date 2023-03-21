import { Readable } from 'readable-stream';
import { DataFactory } from 'rdf-data-factory';
import { ActionContext, Bus } from '@comunica/core';
import { ActorRdfFilterObjectsWithQuadstore } from '../lib/ActorRdfFilterObjectsWithQuadstore';
import { Quad } from '@rdfjs/types';

describe('ActorRdfFilterObjectsWithQuadstore', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfFilterObjectsWithQuadstore instance', () => {
    let actor: ActorRdfFilterObjectsWithQuadstore;
    let input: Readable;

    beforeEach(() => {
      actor = new ActorRdfFilterObjectsWithQuadstore({ name: 'actor', bus });
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
