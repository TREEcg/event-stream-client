import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core/lib/Actor';

import type * as RDF from 'rdf-js';
import {Quad, Stream} from "rdf-js";

/**
 * An RDF Filter actor that extracts triples from a stream of triples related to a specific object.
 *
 * Actor types:
 * * Input:  IActionRdfFilterObject:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfFilterObjectOutput: TODO: fill in.
 *
 * @see IActionRdfFilterObject
 * @see IActorRdfFilterObjectOutput
 */
export abstract class ActorRdfFilterObject extends Actor<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput> {
  public constructor(args: IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>) {
    super(args);
  }
}

export interface IActionRdfFilterObject extends IAction {
  /**
   * The object identifier from which the quads will be filtered.
   */
  objectURI: string;
  /**
   * The unfiltered quad data stream.
   */
  data: RDF.Stream;
  /**
   * Constraints that must be applied to filter.
   */
  constraints?: any;
}

export interface IActorRdfFilterObjectOutput extends IActorOutput {
  /**
  * The object identifier from which the quads were filtered.
  */
  objectURI: string;
  /**
   * The filtered quad data stream related to the object
   */
  data: any; // RDF.Stream
}
