import { Bus } from '@comunica/core';
import { ActorRdfFilterObjectsWithQuadstore } from '../lib/ActorRdfFilterObjectsWithQuadstore';

describe('ActorRdfFilterObjectsWithQuadstore', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfFilterObjectsWithQuadstore instance', () => {
    let actor: ActorRdfFilterObjectsWithQuadstore;

    beforeEach(() => {
      actor = new ActorRdfFilterObjectsWithQuadstore({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
