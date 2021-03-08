import { Actor, IAction, IActorArgs, IActorOutput, IActorTest } from '@comunica/core';
import * as RDF from "rdf-js";
import {ContextDefinition} from "jsonld";

/**
 * A Comunica actor that frames a stream of quads
 *
 * Actor types:
 * * Input:  IActionRdfFrame:      TODO: fill in.
 * * Test:   <none>
 * * Output: IActorRdfFrameOutput: TODO: fill in.
 *
 * @see IActionRdfFrame
 * @see IActorRdfFrameOutput
 */
export abstract class ActorRdfFrame extends Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput> {
  public constructor(args: IActorArgs<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>) {
    super(args);
  }
}

export interface IActionRdfFrame extends IAction {
  /**
   * The quad data stream
   */
  data: any; // RDF.Stream
  /**
   * The JSON-LD frame
   */
  frame: any;
  /**
   * Optional JSON-LD context
   */
  jsonLdContext?: ContextDefinition;
}

export interface IActorRdfFrameOutput extends IActorOutput {
  /**
   * The framed JSON-LD object
   */
  data: object;
}
