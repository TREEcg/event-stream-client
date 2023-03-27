import { ActorRdfFrame, IActionRdfFrame, IActorRdfFrameOutput } from '@treecg/bus-rdf-frame';
import { IActorArgs, IActorTest } from "@comunica/core";
import * as jsonld from 'jsonld';
import { ContextDefinition, JsonLdDocument } from "jsonld/jsonld";
import { Frame } from 'jsonld/jsonld-spec';
import { MediatorRdfSerializeHandle } from "@comunica/bus-rdf-serialize";

const stringifyStream = require('stream-to-string');

/**
 * A comunica RDF Frame Actor that creates a JSON-LD object from a quad stream using framing and compaction
 */
export class ActorRdfFrameWithJSONLDjs extends ActorRdfFrame {

  public readonly mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;

  public constructor(args: IActorRdfFrameWithJSONLDjsArgs) {
    super(args);
  }

  public async test(action: IActionRdfFrame): Promise<IActorTest> {
    return true; // TODO implement
  }

  public async run(action: IActionRdfFrame): Promise<IActorRdfFrameOutput> {
    // @ts-ignore
    const obj: JsonLdDocument = JSON.parse(await stringifyStream((await this.mediatorRdfSerializeHandle.mediate({
      context: action.context,
      handle: { quadStream: action.data, context: action.context },
      handleMediaType: "application/ld+json"
    })).handle.data));

    let result: Map<Frame, JsonLdDocument> = new Map();
    for (let frame of action.frames) {
      // Frame the JSON-LD object
      const framed = await jsonld.frame(obj, frame);

      // Fetch JSON-LD context for compaction
      const context: ContextDefinition = <ContextDefinition>(action.jsonLdContext ?
        action.jsonLdContext :
        { "@context": {} });
      const compacted = await jsonld.compact(framed, context);

      //const output : IActorRdfFrameOutput = {
      //  data: compacted
      //}

      result.set(frame, compacted);
    }

    return {
      data: result
    };
  }
}

export interface IActorRdfFrameWithJSONLDjsArgs extends IActorArgs<IActionRdfFrame, IActorTest, IActorRdfFrameOutput> {
  mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;
}
