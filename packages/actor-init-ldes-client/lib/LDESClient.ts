import {ActorInit, IActionInit, IActorOutputInit} from "@comunica/bus-init/lib/ActorInit";
import {Actor, IAction, IActorArgs, IActorTest, Mediator} from "@comunica/core";
import type {
    IActionRdfMetadataExtract,
    IActorRdfMetadataExtractOutput,
} from '@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract';

import * as moment from 'moment';

import { DataFactory } from 'rdf-data-factory';
import type * as RDF from 'rdf-js';

const DF: RDF.DataFactory = new DataFactory();

import { Readable, Writable } from 'stream';
const readStream = new Readable({objectMode: true});
 readStream._read = () => {
     // Do nothing
};

const FETCH_PAUSE = 2000; // in milliseconds; pause before fetching the next fragment

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
const {http, https} = followRedirects;
const CacheableRequest = require('cacheable-request');
const cacheableRequestHttp = new CacheableRequest(http.request);
const cacheableRequestHttps = new CacheableRequest(https.request);
const CachePolicy = require('http-cache-semantics');

import {ContextDefinition, JsonLdDocument} from "jsonld";

import minimist = require("minimist");

const stringifyStream = require('stream-to-string');
const streamifyString = require('streamify-string');

const LRUcache = new Set();
import { existsSync, readFileSync } from 'fs';

import {Bookkeeper} from './Bookkeeper';
import {ActorRdfMetadataExtract} from "@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract";
import {
    IActionHandleRdfParse,
    IActorOutputHandleRdfParse,
    IActorTestHandleRdfParse
} from "@comunica/bus-rdf-parse";
import {IActionRdfFilterObject, IActorRdfFilterObjectOutput} from "../../bus-rdf-filter-object";
import {IActionRdfFrame, IActorRdfFrameOutput} from "../../bus-rdf-frame";
import {
    IActionSparqlSerializeHandle,
    IActorOutputSparqlSerializeHandle,
    IActorTestSparqlSerializeHandle
} from "@comunica/bus-sparql-serialize";
import {IActorQueryOperationOutputQuads} from "@comunica/bus-query-operation";
import {Quad, Stream} from "rdf-js";

import * as f from "@dexagod/rdf-retrieval";
import {AsyncIterator} from "asynciterator";
import {Frame} from "jsonld/jsonld-spec";

let bk = new Bookkeeper();

export class LDESClient extends ActorInit implements ILDESClientArgs {
    public static readonly HELP_MESSAGE = `actor-init-ldes-client syncs event streams
  Usage:
    actor-init-ldes-client --pollingInterval 5000 https://lodi.ilabt.imec.be/coghent/industriemuseum/objecten

  Options:
    --pollingInterval            Number of milliseconds before refetching uncacheable fragments (e.g., 5000)
    --mimeType                   the MIME type of the output (e.g., application/ld+json)
    --context                    path to a file with the JSON-LD context you want to use when MIME type is application/ld+json (e.g., ./context.jsonld)
    --disablePolling             whether to disable polling or not (by default set to "false", polling is enabled). Value can be set to "true" or "false"
    --fromTime                   datetime to prune relations that have a lower datetime value (e.g., 2020-01-01T00:00:00)
    --emitMemberOnce             whether to emit a member only once, because collection contains immutable version objects. Value can be set to "true" or "false"
    --help                       print this help message
  `;

    public readonly mediatorRdfMetadataExtractTree: Mediator<ActorRdfMetadataExtract,
        IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;

    public readonly mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>,
        IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;

    public readonly mediatorRdfFilterObject: Mediator<Actor<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>,
        IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>;

    public readonly mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>,
        IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;

    public readonly mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>,
        IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;

    public pollingInterval: number;
    public mimeType: string;
    public jsonLdContextPath: string;
    public jsonLdContextString: string;
    public jsonLdContext: ContextDefinition;
    public emitMemberOnce: boolean;
    public fromTime: Date;
    public disablePolling: boolean;

    private emitMemberOnceHasBeenConfigured: boolean = false;

    public constructor(args: ILDESClientArgs) {
        super(args);
    }

    public async test(action: IActionInit): Promise<IActorTest> {
        return true;
    }

    public async run(action: IActionInit): Promise<IActorOutputInit> {
        const args = minimist(action.argv);
        const pollingInterval: number = args.pollingInterval ? parseInt(args.pollingInterval) : this.pollingInterval;
        const mimeType: string = args.mimeType ? args.mimeType : this.mimeType;
        if (args.context && existsSync(args.context)) {
            this.jsonLdContextString = readFileSync(args.context, 'utf8');
        } else if (this.jsonLdContextPath != "" && existsSync(this.jsonLdContextPath)) {
            this.jsonLdContextString = readFileSync(this.jsonLdContextPath, 'utf8');
        }
        if (args.fromTime && moment(args.fromTime).isValid())
            this.fromTime = new Date(args.fromTime);

        if (args.emitMemberOnce) {
            this.emitMemberOnce = args.emitMemberOnce;
            this.emitMemberOnceHasBeenConfigured = true;
        }
        if (args.disablePolling) {
            this.disablePolling = args.disablePolling;
        }

        if (args["_"].length) {
            const url = args._[args._.length - 1];

            this.createReadStream(url, {"pollingInterval": pollingInterval, "mimeType": mimeType, "jsonLdContext": JSON.parse(this.jsonLdContextString)});
            return {'stdout': readStream}
        } else return {stderr: require('streamify-string')(<Error>new Error(LDESClient.HELP_MESSAGE))};
    }

    public createReadStream(url: string, options: { pollingInterval?: number; mimeType?: string, jsonLdContext?: ContextDefinition, fromTime?: Date, emitMemberOnce?: boolean}) {
        if (options.pollingInterval) this.pollingInterval = options.pollingInterval;
        if (options.mimeType) this.mimeType = options.mimeType;
        this.jsonLdContext = options.jsonLdContext ? options.jsonLdContext : JSON.parse(this.jsonLdContextString);
        if (options.fromTime && moment(options.fromTime).isValid()) this.fromTime = options.fromTime;
        if (options.emitMemberOnce) {
            this.emitMemberOnce = options.emitMemberOnce;
            this.emitMemberOnceHasBeenConfigured = true;
        }

        this.retrieve(url);
        return readStream;
    }

    protected async retrieve(pageUrl: string) {
        super.logDebug(undefined, 'GET ' + pageUrl);
        console.error('GET ' + pageUrl)

        const startTime = new Date();

        try {
            const page = await this.getPage(pageUrl);
            const message = '' + page.statusCode + ' ' + page.url + ' (' + (new Date().getTime() - startTime.getTime()) + 'ms)';
            super.logDebug(undefined, message);
            console.error(message)

            // Add to LRU cache that the fragment has been retrieved
            LRUcache.add(pageUrl);
            LRUcache.add(page.url); // can be a redirected response <> pageUrl

            // Retrieve media type
            // TODO: Fetch mediaType by using response and comunica actor
            const mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];

            if (!this.disablePolling) {
                // Based on the HTTP Caching headers, poll this fragment
                const policy = new CachePolicy(page.request, page.response, {shared: false}); // If options.shared is false, then the response is evaluated from a perspective of a single-user cache (i.e. private is cacheable and s-maxage is ignored)
                const ttl = policy.storable() ? policy.timeToLive() : this.pollingInterval; // pollingInterval is fallback
                bk.addFragment(page.url, ttl);
            }

            const quadsArrayOfPage = await this.stringToQuadArray(page.data.toString(), '', mediaType);

            // Parse into RDF Stream to retrieve TREE metadata
            const treeMetadata = await this.mediatorRdfMetadataExtractTree.mediate({
                metadata: await this.quadArrayToQuadStream(quadsArrayOfPage),
                url: page['url']
            });

            const members : string[] = this.getMembers(treeMetadata);

            // Get prov:generatedAtTime of members
            const memberToGeneratedAtTime = await this.mapMembersToGeneratedAtTime(quadsArrayOfPage, members);

            let membersToProcess: string[] = [];
            for (let member of members) {
                // Only process member when its prov:generatedAtTime is higher
                if (!this.fromTime || (moment(this.fromTime).isValid() && memberToGeneratedAtTime[member].getTime() >= this.fromTime.getTime())) {
                    // Process if LRU Cache doesn't recognize
                    // Or when it is configured that members may be emitted multiple times
                    // Otherwise don't process the member
                    if (!LRUcache.has(member) || !this.emitMemberOnce) {
                        LRUcache.add(member);
                        membersToProcess.push(member);
                    }
                }
            }

            // Filter the quads that are relevant for each member
            const quadstreamPerMember = (await this.mediatorRdfFilterObject.mediate({
                data: await this.quadArrayToQuadStream(quadsArrayOfPage),
                objectURIs: membersToProcess,
                constraints: undefined
            })).data; // Map<string, RDF.Stream>

            // Serialize back into string
            for(let member of Array.from( quadstreamPerMember.keys()) ) {
                const memberQuadstream = quadstreamPerMember.get(member);
                if (memberQuadstream) {
                    let outputString;
                    if (this.mimeType != "application/ld+json") {
                        const handle: IActorQueryOperationOutputQuads = {
                            type: "quads",
                            quadStream: <RDF.Stream & AsyncIterator<RDF.Quad>> memberQuadstream
                        };
                        outputString = await stringifyStream((await this.mediatorRdfSerialize.mediate({
                            handle: handle,
                            handleMediaType: this.mimeType
                        })).handle.data);
                    } else {
                        // Create framed JSON-LD output
                        const frame = {
                            "@id": member
                        };
                        const framedObjects: Map<Frame, JsonLdDocument> = (await this.mediatorRdfFrame.mediate({
                            data: memberQuadstream,
                            frames: [frame],
                            jsonLdContext: this.jsonLdContext
                        })).data;
                        outputString = JSON.stringify(framedObjects.get(frame));
                    }
                    readStream.push(`${outputString}\n`);
                }
            };


            // Retrieve TREE relations towards other nodes
            for (const [_, relation] of treeMetadata.metadata.treeMetadata.relations) {
                // Prune when the value of the relation is a datetime and less than what we need
                // To be enhanced when more TREE filtering capabilities are available
                if (this.fromTime && relation["@type"][0] === "https://w3id.org/tree#LessThanRelation"
                    && moment(relation.value[0]["@value"]).isValid()
                    && new Date(relation.value[0]["@value"]).getTime() <= this.fromTime.getTime()) {
                    // Prune - do nothing
                } else {
                    // Add node to book keeper with ttl 0 (as soon as possible)
                    for (const node of relation.node) {
                        // do not add when polling is disabled and node has already been processed
                        if (!this.disablePolling || (this.disablePolling && !LRUcache.has(node['@id']))) bk.addFragment(node['@id'], 0);
                    }
                }
            }

            this.retrieveRecursively();
        } catch (e) {
            super.logError(undefined, 'Failed to retrieve ' + pageUrl + ': ' + e);
            console.error('Failed to retrieve ' + pageUrl + ': ' + e);
            this.retrieveRecursively();
        }
    }

    private async retrieveRecursively() {
        if (bk.nextFragmentExists()) {
            let next = bk.getNextFragmentToFetch();
            let now = new Date();
            // Do not refetch too soon
            while (next.refetchTime.getTime() > now.getTime()) {
                await this.sleep(FETCH_PAUSE);
                console.error("Waiting " + (next.refetchTime - now.getTime())/1000 + "s before refetching: " + next.url);
                now = new Date();
            }
            this.retrieve(next.url);
        } else {
            console.error("done")
            // We're done
            readStream.push(null);
        }
    }

    public getPage(pageUrl: string): Promise<PageMetadata> {
        return new Promise((resolve, reject) => {
            const protocol = new URL(pageUrl).protocol;
            let r = protocol === 'https:' ? cacheableRequestHttps : cacheableRequestHttp;

            const cacheReq = r(pageUrl, (res: any) => {
                let data = '';

                // A chunk of data has been recieved.
                res.on('data', (chunk: any) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    if (!res['req']) res['req'] = {};
                    // This is necessary for cachePolicy
                    res['req']['headers'] = res['headers'];
                    resolve({
                        "request": res.req,
                        "response": res,
                        "headers": res.headers,
                        "url": res.responseUrl ? res.responseUrl : pageUrl,
                        "data": data,
                        "statusCode": res.statusCode,
                        "fromCache": res.fromCache
                    });
                })
            })

            cacheReq.on('request', (request: any) => request.end());
            cacheReq.on('error', (e: any) => reject(e));
        });
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async stringToQuadStream(data: string, baseIRI: string, mediaType: string): Promise<RDF.Stream> {
        return (await this.mediatorRdfParse.mediate({
            handle: {
                input: streamifyString(data),
                baseIRI: baseIRI
            }, handleMediaType: mediaType
        })).handle.quads
    }

    protected async stringToQuadArray(data: string, baseIRI: string, mediaType: string): Promise<RDF.Quad[]> {
        return new Promise(async (resolve, reject) => {
            let quadArray: RDF.Quad[] = [];
            const stream = (await this.mediatorRdfParse.mediate({
                handle: {
                    input: streamifyString(data),
                    baseIRI: baseIRI
                }, handleMediaType: mediaType
            })).handle.quads;
            stream.on('data', (quad) => {
                quadArray.push(quad);
            });
            stream.on('end', () => {
                resolve(quadArray);
            });
        });
    }

    protected async quadArrayToQuadStream(data: RDF.Quad[]): Promise<RDF.Stream> {
        return new Promise(async (resolve, reject) => {
            resolve(f.quadArrayToQuadStream(data.slice()));
        });
    }

    // Returns array of memberURI (string) -> immutable (boolean)
    protected getMembers(treeMetadata: any) : string[] {
        let members : string[] = [];
        // Retrieve members from all collections found in the fragment
        const collections = treeMetadata.metadata.treeMetadata.collections;
        for (const [c, collectionValue] of collections.entries()) {
            for (let m in collectionValue.member) {
                const member = collectionValue.member[m]["@id"];
                members.push(member);
            }
        }
        return members;
    }

    private mapMembersToGeneratedAtTime(quadArrayToFetchGeneratedAtTimes: RDF.Quad[], members: string[]): Record<string, Date> {
        const memberToGeneratedAtTime: Record<string, Date> = {};

        for (let quad of quadArrayToFetchGeneratedAtTimes) {
            if (quad.subject.termType === 'NamedNode') {
                const potentialMember = quad.subject.value;
                const predicate = quad.predicate.value;
                if (members.indexOf(potentialMember) != -1 && predicate === "http://www.w3.org/ns/prov#generatedAtTime")
                    memberToGeneratedAtTime[potentialMember] = new Date(quad.object.value);
            }
        }
        return memberToGeneratedAtTime;
    }
}

class PageMetadata {
    public "request": object;
    public "response": object;
    public "headers": any;
    public "url": any;
    public "data": string;
    public "statusCode": number;
    public "fromCache": boolean;
}

export interface ILDESClientArgs extends IActorArgs<IActionInit, IActorTest, IActorOutputInit> {
    mediatorRdfMetadataExtractTree: Mediator<
        ActorRdfMetadataExtract,
        IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;
    mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>, IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>
    mediatorRdfFilterObject: Mediator<
        Actor<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>,
        IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>;
    mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>, IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;
    mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>,
        IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
    pollingInterval: number;
    mimeType: string;
    jsonLdContextPath: string;
    jsonLdContextString: string;
    emitMemberOnce: boolean;
    disablePolling: boolean;
    fromTime: Date;
}