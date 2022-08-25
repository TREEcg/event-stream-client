import {Actor, IAction, IActorArgs, IActorOutput, IActorTest, Mediate} from '@comunica/core';
import * as RDF from "rdf-js";
import { JsonLdDocument} from "jsonld";
import { Frame } from 'jsonld/jsonld-spec';

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
  /**
   * @param args - @defaultNested {<default_bus> a <cc:components/Bus.jsonld#Bus>} bus
   */
  public constructor(args: IActorArgs<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>) {
    super(args);
  }
}

export interface IActionRdfFrame extends IAction {
  /**
   * The quad data stream
   */
  data: RDF.Stream; // RDF.Stream
  /**
   * The JSON-LD frames
   */
  frames: Frame[];
  /**
   * Optional JSON-LD context
   */
  jsonLdContext?: JsonLdDocument;
}

export interface IActorRdfFrameOutput extends IActorOutput {
  /**
   * The framed JSON-LD object for every frame
   */
  data: Map<Frame, JsonLdDocument>;
}

export type MediatorRdfFrame = Mediate<IActionRdfFrame, IActorRdfFrameOutput>;
