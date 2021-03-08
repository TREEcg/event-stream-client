import { ActorRdfFilterObject } from '@comunica/bus-rdf-filter-object';
import { Bus } from '@comunica/core';
import { ActorRdfFilterObjectWithFraming } from '../lib/ActorRdfFilterObjectWithFraming';

describe('ActorRdfFilterObjectRdfFilterObjectWithFraming', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfFilterObjectWithFraming instance', () => {
    let actor: ActorRdfFilterObjectWithFraming;

    beforeEach(() => {
      actor = new ActorRdfFilterObjectWithFraming({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
