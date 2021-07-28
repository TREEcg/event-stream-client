import { Actor, IActorTest, Mediator } from "@comunica/core";
import type {
    IActionRdfMetadataExtract,
    IActorRdfMetadataExtractOutput,
} from '@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract';

import * as moment from 'moment';

import { DataFactory } from 'rdf-data-factory';
import type * as RDF from 'rdf-js';

const DF: RDF.DataFactory = new DataFactory();

import { Readable } from 'stream';

const FETCH_PAUSE = 2000; // in milliseconds; pause before fetching the next fragment

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
const { http, https } = followRedirects;
const CacheableRequest = require('cacheable-request');
const cacheableRequestHttp = new CacheableRequest(http.request);
const cacheableRequestHttps = new CacheableRequest(https.request);
const CachePolicy = require('http-cache-semantics');

import { ContextDefinition, JsonLdDocument } from "jsonld";

const stringifyStream = require('stream-to-string');
const streamifyString = require('streamify-string');

import { Bookkeeper } from './Bookkeeper';
import { ActorRdfMetadataExtract } from "@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract";
import {
    IActionHandleRdfParse,
    IActorOutputHandleRdfParse,
    IActorTestHandleRdfParse
} from "@comunica/bus-rdf-parse";
import { IActionRdfFrame, IActorRdfFrameOutput } from "../../bus-rdf-frame";
import {
    IActionSparqlSerializeHandle,
    IActorOutputSparqlSerializeHandle,
    IActorTestSparqlSerializeHandle
} from "@comunica/bus-sparql-serialize";
import { IActorQueryOperationOutputQuads } from "@comunica/bus-query-operation";

import * as f from "@dexagod/rdf-retrieval";
import { AsyncIterator, ArrayIterator } from "asynciterator";
import { Frame } from "jsonld/jsonld-spec";

const urlLib = require('url');

import rdfDereferencer from "rdf-dereference";

export interface IEventStreamArgs {
    pollingInterval?: number,
    mimeType?: string,
    jsonLdContext?: ContextDefinition,
    fromTime?: Date,
    emitMemberOnce?: boolean,
    disablePolling?: boolean,
    dereferenceMembers?: boolean,
}

export interface IEventStreamMediators {
    mediatorRdfMetadataExtractTree: Mediator<ActorRdfMetadataExtract,
        IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;

    mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>,
        IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;

    mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>,
        IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;

    mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>,
        IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
}

interface IMember {
    uri: string,
    quads: RDF.Stream<RDF.Quad> & AsyncIterator<RDF.Quad>,
}

export class EventStream extends Readable {
    protected readonly mediators: IEventStreamMediators;

    protected readonly pollingInterval?: number;
    protected readonly mimeType?: string;
    protected readonly jsonLdContext?: ContextDefinition;
    protected readonly emitMemberOnce?: boolean;
    protected readonly fromTime?: Date;
    protected readonly disablePolling?: boolean;
    protected readonly dereferenceMembers?: boolean;
    protected readonly accessUrl: string;

    protected readonly processedURIs: Set<string>;
    protected readonly bookie: Bookkeeper;

    public constructor(
        url: string,
        mediators: IEventStreamMediators,
        args: IEventStreamArgs,
    ) {
        super({ objectMode: true });
        this.mediators = mediators;

        this.accessUrl = url;
        this.fromTime = args.fromTime;
        this.disablePolling = args.disablePolling;
        this.pollingInterval = args.pollingInterval;
        this.mimeType = args.mimeType;
        this.jsonLdContext = args.jsonLdContext;
        this.dereferenceMembers = args.dereferenceMembers;
        this.emitMemberOnce = args.emitMemberOnce;

        this.processedURIs = new Set();
        this.bookie = new Bookkeeper();

        this.bookie.addFragment(this.accessUrl, 0);
        this.start();
    }

    public ignorePages(urls: string[]) {
        for (const url of urls) {
            this.processedURIs.add(url);
        }
    }

    public _read() {
        // Do nothing
    }

    protected log(msg: string) {
        // Fixme: use normal logging library
        console.info(msg);
    }

    protected async start() {
        while (this.bookie.nextFragmentExists()) {
            let next = this.bookie.getNextFragmentToFetch();
            let now = new Date();
            // Do not refetch too soon
            while (next.refetchTime.getTime() > now.getTime()) {
                await this.sleep(FETCH_PAUSE);
                this.log("Waiting " + (next.refetchTime - now.getTime()) / 1000 + "s before refetching: " + next.url);
                now = new Date();
            }
            await this.retrieve(next.url);
        } 

        // We're done
        this.log("done")
        this.push(null);
    }

    protected async retrieve(pageUrl: string) {
        this.log('GET ' + pageUrl);
        const startTime = new Date();

        try {
            const page = await this.getPage(pageUrl);
            const message = `${page.statusCode} ${page.url} (${new Date().getTime() - startTime.getTime()}) ms`;
            this.log(message);

            // Remember that the fragment has been retrieved
            this.processedURIs.add(pageUrl);
            this.processedURIs.add(page.url); // can be a redirected response <> pageUrl

            // Retrieve media type
            // TODO: Fetch mediaType by using response and comunica actor
            const mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];

            if (!this.disablePolling) {
                // Based on the HTTP Caching headers, poll this fragment
                const policy = new CachePolicy(page.request, page.response, { shared: false }); // If options.shared is false, then the response is evaluated from a perspective of a single-user cache (i.e. private is cacheable and s-maxage is ignored)
                const ttl = policy.storable() ? policy.timeToLive() : this.pollingInterval; // pollingInterval is fallback
                this.bookie.addFragment(page.url, ttl);
            }

            const quadsArrayOfPage = await this.stringToQuadArray(page.data.toString(), '', mediaType);

            // Parse into RDF Stream to retrieve TREE metadata
            const treeMetadata = await this.mediators.mediatorRdfMetadataExtractTree.mediate({
                metadata: await this.quadArrayToQuadStream(quadsArrayOfPage),
                url: page.url
            });
            this.emit("metadata", {...treeMetadata, url: page.url});

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
                        if (!this.disablePolling || (this.disablePolling && !this.processedURIs.has(node['@id']))) {
                            this.bookie.addFragment(node['@id'], 0);
                        }
                    }
                }
            }

            const memberUris: string[] = this.getMemberUris(treeMetadata);
            const members = this.getMembers(quadsArrayOfPage, memberUris);

            this.processMembers(members);
        } catch (e) {
            this.log('Failed to retrieve ' + pageUrl + ': ' + e);
        }
    }

    protected async* getMembers(quads: RDF.Quad[], memberUris: string[]): AsyncGenerator<IMember> {
        const subjectIndex: Record<string, RDF.Quad[]> = {};
        for (const quad of quads) {
            const subject = quad.subject.value;
            if (!subjectIndex[subject]) {
                subjectIndex[subject] = [ quad ];        
            } else {
                subjectIndex[subject].push(quad);
            }
        }

        const result: Record<string, AsyncIterator<RDF.Quad>> = {};
        for (const memberUri of memberUris) {
            if (this.fromTime) {
                // Check the event time; skip if needed
                const eventTime = this.extractEventTime(subjectIndex[memberUri]);
                if (!eventTime || eventTime < this.fromTime) {
                    continue;
                }
            }

            if (this.emitMemberOnce && this.processedURIs.has(memberUri)) {
                // This event has already been emitted
                continue;
            }

            this.processedURIs.add(memberUri);

            const done = new Set(memberUris);
            if (!this.dereferenceMembers) {
                yield this.getMember(memberUri, subjectIndex, done);
            } else {
                const { quads } = await rdfDereferencer.dereference(memberUri);
                yield {
                    uri: memberUri,
                    quads,
                } as IMember;
            }
        }
        return result;
    }

    protected getMember(memberUri: string, subjectIndex: Record<string, RDF.Quad[]>, done: Set<string>): IMember {
        const queue: string[] = [ memberUri ];
        const result: RDF.Quad[] = [];

        while (queue.length > 0) {
            const subject = queue.pop();

            if (!subject) {
                // Type coercion, should never happen
                break;
            }

            if (!subjectIndex[subject]) {
                // Nothing is known about this resource
                continue;
            }

            for (const quad of subjectIndex[subject]) {
                result.push(quad);

                if (quad.object.termType === 'NamedNode' || quad.object.termType === 'BlankNode') {
                    if (!done.has(quad.object.value)) {
                        done.add(quad.object.value);
                        queue.push(quad.object.value);
                    }
                }
            }
        }

        return {
            uri: memberUri,
            quads: new ArrayIterator(result),
        };
    }

    protected async processMembers(members: AsyncGenerator<IMember>) {
        // Serialize back into string
        for await (const member of members) {
            const id = member.uri;
            const quadStream = member.quads;

            let outputString;
            if (this.mimeType != "application/ld+json") {
                const handle: IActorQueryOperationOutputQuads = {
                    type: "quads",
                    quadStream: quadStream,
                };
                outputString = await stringifyStream((await this.mediators.mediatorRdfSerialize.mediate({
                    handle: handle,
                    handleMediaType: this.mimeType
                })).handle.data);
            } else {
                // Create framed JSON-LD output
                const frame = {
                    "@id": id
                };
                const framedObjects: Map<Frame, JsonLdDocument> = (await this.mediators.mediatorRdfFrame.mediate({
                    data: quadStream,
                    frames: [frame],
                    jsonLdContext: this.jsonLdContext
                })).data;
                outputString = JSON.stringify(framedObjects.get(frame));
            }
            this.push(`${outputString}\n`);
        };
    }

    protected getPage(pageUrl: string): Promise<PageMetadata> {
        return new Promise((resolve, reject) => {
            const protocol = new URL(pageUrl).protocol;
            let r = protocol === 'https:' ? cacheableRequestHttps : cacheableRequestHttp;

            const options = {
                ...urlLib.parse(pageUrl),
                headers: {
                    Accept: 'text/turtle;application/ld+json',
                }
            };

            const cacheReq = r(options, (res: any) => {
                let data = '';

                // A chunk of data has been recieved.
                res.on('data', (chunk: any) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    if (!res['req']) {
                        res['req'] = {};
                    }
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

    protected sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async stringToQuadStream(data: string, baseIRI: string, mediaType: string): Promise<RDF.Stream> {
        return (await this.mediators.mediatorRdfParse.mediate({
            handle: {
                input: streamifyString(data),
                baseIRI: baseIRI
            }, handleMediaType: mediaType
        })).handle.quads
    }

    protected async stringToQuadArray(data: string, baseIRI: string, mediaType: string): Promise<RDF.Quad[]> {
        return new Promise(async (resolve, reject) => {
            let quadArray: RDF.Quad[] = [];
            const stream = (await this.mediators.mediatorRdfParse.mediate({
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
    protected getMemberUris(treeMetadata: any): string[] {
        let members: string[] = [];
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

    protected extractEventTime(quads: RDF.Quad[]): Date | undefined {
        for (const quad of quads) {
            if (quad.subject.termType === 'NamedNode') {
                const predicate = quad.predicate.value;
                if (predicate === "http://www.w3.org/ns/prov#generatedAtTime") {
                    // Todo: make predicate configurable OR read from stream metadata
                    return new Date(quad.object.value);
                }
            }
        }

        return undefined;
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