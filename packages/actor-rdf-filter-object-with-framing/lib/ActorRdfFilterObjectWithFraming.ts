import { ActorRdfFilterObject, IActionRdfFilterObject, IActorRdfFilterObjectOutput } from '@treecg/bus-rdf-filter-object';
import {Actor, IActorArgs, IActorTest, Mediator} from '@comunica/core';
import * as RDF from "rdf-js";
import {IActionRdfFrame, IActorRdfFrameOutput} from "../../bus-rdf-frame";
import {JsonLdDocument} from "jsonld/jsonld";
import { Frame, Url, JsonLdProcessor, RemoteDocument, JsonLdObj, JsonLdArray } from 'jsonld/jsonld-spec';

import {
  IActionHandleRdfParse,
  IActorOutputHandleRdfParse,
  IActorTestHandleRdfParse
} from "@comunica/bus-rdf-parse";

import * as f from "@dexagod/rdf-retrieval"
import { Store, Quad } from "n3"
import { storeStream } from 'rdf-store-stream';

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

    const results = new Map<string, RDF.Quad[]>();
    const store: Store = (await storeStream(action.data)) as Store

    for (let id of action.objectURIs) {
      const quads = this.retrieveMember(store, id)
      results.set(id, quads)
    }

    return {
      data: results
    };
  }

  private retrieveMember(store: Store, id: string) {
    const ids : string[] = []
    function retrieveId(id: string) : Quad[] {
      if (ids.indexOf(id) !== -1) return [];
      ids.push(id)
      let quads : Quad[] = store.getQuads(id, null, null, null) || []
      for (let quad of quads) {
        quads = quads.concat(retrieveId(quad.object.id))
      }
      return quads
    }
    return retrieveId(id)
  }


}

export interface IActorRdfFilterObjectWithFramingArgs extends IActorArgs<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput> {
  mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>
  mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>, IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;
}

