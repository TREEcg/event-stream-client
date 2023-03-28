import { ActorRdfFrame, IActionRdfFrame, IActorRdfFrameOutput } from '@treecg/bus-rdf-frame';
import { IActorArgs, IActorTest } from "@comunica/core";
import { Readable as StreamReadable } from 'stream';
import * as jsonld from 'jsonld';
import { ContextDefinition, JsonLdDocument } from "jsonld/jsonld";
import { Frame } from 'jsonld/jsonld-spec';
import { MediatorRdfSerializeHandle } from "@comunica/bus-rdf-serialize";

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
    const result: Map<Frame, JsonLdDocument> = new Map();
    const dataStream = await this.mediatorRdfSerializeHandle.mediate({
      context: action.context,
      handle: { quadStream: action.data, context: action.context },
      handleMediaType: "application/ld+json"
    });

    const dataString = await this.stream2String(<StreamReadable>dataStream.handle.data);

    if (dataString) {
      const obj: JsonLdDocument = JSON.parse(dataString);

      for (let frame of action.frames) {
        // Frame the JSON-LD object
        const framed = await jsonld.frame(obj, frame);

        // Fetch JSON-LD context for compaction
        const context: ContextDefinition = <ContextDefinition>(action.jsonLdContext ?
          action.jsonLdContext :
          { "@context": {} });
        const compacted = await jsonld.compact(framed, context);
        result.set(frame, compacted);
      }
    }
    return {
      data: result
    };
  }

  private stream2String(stream: StreamReadable): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let text: string = '';
      stream.on('data', (data) => {
        text += data?.toString();
      }).on('end', () => resolve(text))
        .on('error', (err: Error) => reject(err))
    });
  };
}

export interface IActorRdfFrameWithJSONLDjsArgs extends IActorArgs<IActionRdfFrame, IActorTest, IActorRdfFrameOutput> {
  mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;
}
