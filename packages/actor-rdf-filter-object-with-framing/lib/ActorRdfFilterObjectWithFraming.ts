import { ActorRdfFilterObject, IActionRdfFilterObject, IActorRdfFilterObjectOutput } from "@treecg/bus-rdf-filter-object";
import {Actor, IActorArgs, IActorTest, Mediator} from '@comunica/core';
import * as RDF from "rdf-js";
import {IActionRdfFrame, IActorRdfFrameOutput, MediatorRdfFrame} from "@treecg/bus-rdf-frame";
import {JsonLdDocument} from "jsonld/jsonld";
import { Frame, Url, JsonLdProcessor, RemoteDocument, JsonLdObj, JsonLdArray } from 'jsonld/jsonld-spec';

import {
  IActionRdfParseHandle,
  IActorOutputRdfParseHandle,
  IActorTestRdfParseHandle, MediatorRdfParseHandle
} from "@comunica/bus-rdf-parse";

import * as f from "@dexagod/rdf-retrieval"

/**
 * An RDF Filter Object actor that extracts quads related to a specific object using JSON-LD framing.
 */
export class ActorRdfFilterObjectWithFraming extends ActorRdfFilterObject {

  public readonly mediatorRdfParseHandle: MediatorRdfParseHandle;

  public readonly mediatorRdfFrame: MediatorRdfFrame;

  public constructor(args: IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>) {
    super(args);
  }

  public async test(action: IActionRdfFilterObject): Promise<IActorTest> {
    return true; // TODO implement
  }

  public async run(action: IActionRdfFilterObject): Promise<IActorRdfFilterObjectOutput> {
    // We apply a JSON-LD frame on the quad stream to filter on a certain object
    let result: Map<string, RDF.Stream> = new Map();
    let frames = [];
    for (let objectURI of action.objectURIs) {
      const frame: Frame = {
        "@id": objectURI
      };
      frames.push(frame);
    }
      // Retrieve JSON-LD of object
      //let test = await f.quadStreamToString(action.data);
      const frameMapping : Map<Frame, JsonLdDocument> = (await this.mediatorRdfFrame.mediate({context: action.context, data: action.data, frames: frames})).data;

    for (let framedObject of frameMapping.values()) {
      // Convert back into RDF Stream
      const objectURI = (framedObject as any)['@id'];
      let framedObjectAsStream = require('streamify-string')(JSON.stringify(framedObject));
      const filteredDataStream : RDF.Stream = (await this.mediatorRdfParseHandle.mediate({context: action.context, handle: {context: action.context, data: framedObjectAsStream, metadata: { baseIRI: <string> '' }}, handleMediaType: "application/ld+json"})).handle.data;
      result.set(objectURI, filteredDataStream);
    }

    return {
      data: result
    };
  }
}

export interface IActorRdfFilterObjectWithFramingArgs extends IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput> {
  mediatorRdfParseHandle: MediatorRdfParseHandle;
  mediatorRdfFrame: MediatorRdfFrame;
}

