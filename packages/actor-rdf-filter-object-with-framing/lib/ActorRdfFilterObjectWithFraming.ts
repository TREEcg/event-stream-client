import { ActorRdfFilterObject, IActionRdfFilterObject, IActorRdfFilterObjectOutput } from '@treecg/bus-rdf-filter-object';
import {Actor, IActorArgs, IActorTest, Mediator} from '@comunica/core';
import * as RDF from "rdf-js";
import {IActionRdfFrame, IActorRdfFrameOutput} from "../../bus-rdf-frame";
import {
  IActionHandleRdfParse,
  IActorOutputHandleRdfParse,
  IActorTestHandleRdfParse
} from "@comunica/bus-rdf-parse";

/**
 * An RDF Filter Object actor that extracts quads related to a specific object using JSON-LD framing.
 */
export class ActorRdfFilterObjectWithFraming extends ActorRdfFilterObject {

  public readonly mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>

  public readonly mediatorRdfFrame: Mediator<
      Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>,
      IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;

  public constructor(args: IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>) {
    super(args);
  }

  public async test(action: IActionRdfFilterObject): Promise<IActorTest> {
    return true; // TODO implement
  }

  public async run(action: IActionRdfFilterObject): Promise<IActorRdfFilterObjectOutput> {
    // We apply a JSON-LD frame on the quad stream to filter on a certain object
    const frame = {
      "@id": action.objectURI
    };

    // Retrieve JSON-LD of object
    const framedObject : object = (await this.mediatorRdfFrame.mediate({data: action.data, frame: frame})).data;

    // Convert back into RDF Stream
    let framedObjectAsStream = require('streamify-string')(JSON.stringify(framedObject));
    const filteredDataStream : RDF.Stream = (await this.mediatorRdfParse.mediate({handle: {input: framedObjectAsStream, baseIRI: ''}, handleMediaType: "application/ld+json"})).handle.quads;

    return {
      objectURI: action.objectURI,
      data: filteredDataStream
    };
  }
}

export interface IActorRdfFilterObjectWithFramingArgs extends IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput> {
  mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>
  mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>, IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;
}

