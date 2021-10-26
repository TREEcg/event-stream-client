import { Actor, IActorTest, Mediator } from "@comunica/core";
import { Quad, NamedNode } from "@rdfjs/types";
import type {
    IActionRdfMetadataExtract,
    IActorRdfMetadataExtractOutput,
} from '@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract';

import * as moment from 'moment';

import type * as RDF from 'rdf-js';

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
import { inspect } from 'util';

import RateLimiter from "./RateLimiter";
import MemberIterator from "./MemberIterator";

import type { Member } from "@treecg/types";
import { DataFactory } from 'rdf-data-factory';

export interface IEventStreamArgs {
    pollingInterval?: number,
    representation?: string,
    mimeType?: string,
    jsonLdContext?: ContextDefinition,
    fromTime?: Date,
    emitMemberOnce?: boolean,
    disablePolling?: boolean,
    disableSynchronization?: boolean,
    dereferenceMembers?: boolean,
    requestsPerMinute?: number,
}

export interface IEventStreamMediators {
    mediatorRdfMetadataExtract: Mediator<ActorRdfMetadataExtract,
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
    protected readonly representation?: string;
    protected readonly mimeType?: string;
    protected readonly jsonLdContext?: ContextDefinition;
    protected readonly emitMemberOnce?: boolean;
    protected readonly fromTime?: Date;
    protected readonly disableSynchronization?: boolean;
    protected readonly dereferenceMembers?: boolean;
    protected readonly accessUrl: string;

    protected readonly processedURIs: Set<string>;
    protected readonly bookkeeper: Bookkeeper;
    protected readonly rateLimiter: RateLimiter;

    private downloading: boolean;


    public constructor(
        url: string,
        mediators: IEventStreamMediators,
        args: IEventStreamArgs,
    ) {
        super({ objectMode: true , highWaterMark: 1000});
        this.mediators = mediators;

        this.accessUrl = url;
        this.fromTime = args.fromTime;
        this.disableSynchronization = args.disableSynchronization;
        this.pollingInterval = args.pollingInterval;
        this.representation = args.representation;

        this.mimeType = args.mimeType;
        this.jsonLdContext = args.jsonLdContext;
        this.dereferenceMembers = args.dereferenceMembers;
        this.emitMemberOnce = args.emitMemberOnce;

        if (args.requestsPerMinute) {
            this.rateLimiter = new RateLimiter(60000. / args.requestsPerMinute);
        } else {
            this.rateLimiter = new RateLimiter(0);
        }

        this.processedURIs = new Set();
        this.bookkeeper = new Bookkeeper();

        this.bookkeeper.addFragment(this.accessUrl, 0);

        this.downloading = false;
    }

    public ignorePages(urls: string[]) {
        for (const url of urls) {
            this.bookkeeper.blacklistFragment(url);
        }
    }

    private async fetchNextPage() {
        this.downloading = true;
        let next = this.bookkeeper.getNextFragmentToFetch();
        let now = new Date();
        // Do not refetch too soon
        while (next.refetchTime.getTime() > now.getTime()) {
            await this.sleep(FETCH_PAUSE);
            this.log('info', `Waiting ${(next.refetchTime - now.getTime()) / 1000}s before refetching: ${next.url}`);
            now = new Date();
        }
        return await this.retrieve(next.url).then(() => {
            this.downloading = false;
            this.emit('page processed', next.url);
            this._read();
        });
    }

    public async _read() {
        try {
            if (!this.downloading && this.bookkeeper.nextFragmentExists()) {
                await this.fetchNextPage();
            } 
            else if (!this.downloading) {
                //end of the stream
                this.log('info', "done");
                this.push(null);
            }
        } catch (e) {
            console.error(e);
        }
    }

    protected log(level: string, message: string, data?: any) {
        process.stderr.write(`[${new Date().toISOString()}]  ${level.toUpperCase()}: ${message}\n`);
        if (data) {
            process.stderr.write(`[${new Date().toISOString()}]  ${level.toUpperCase()}: ${inspect(data)}\n`);
        }
    }

    protected async retrieve(pageUrl: string) {
        this.log('info', `GET ${pageUrl}`);
        const startTime = new Date();

        await this.rateLimiter.planRequest(pageUrl);

        try {
            const page = await this.getPage(pageUrl);
            const message = `${page.statusCode} ${page.url} (${new Date().getTime() - startTime.getTime()}) ms`;
            this.log('info', message);

            // Remember that the fragment has been retrieved
            this.processedURIs.add(pageUrl);
            this.processedURIs.add(page.url); // can be a redirected response <> pageUrl

            // Retrieve media type
            // TODO: Fetch mediaType by using response and comunica actor
            const mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];

            if (!this.disableSynchronization && this.pollingInterval) {
                // Based on the HTTP Caching headers, poll this fragment for synchronization
                const policy = new CachePolicy(page.request, page.response, { shared: false }); // If options.shared is false, then the response is evaluated from a perspective of a single-user cache (i.e. private is cacheable and s-maxage is ignored)
                const ttl = Math.max(this.pollingInterval, policy.storable() ? policy.timeToLive() : 0); // pollingInterval is fallback
                this.bookkeeper.addFragment(page.url, ttl);
            }

            const quadsArrayOfPage = await this.stringToQuadArray(page.data.toString(), '', mediaType);

            // Parse into RDF Stream to retrieve TREE metadata
            const treeMetadata = await this.mediators.mediatorRdfMetadataExtract.mediate({
                metadata: await this.quadArrayToQuadStream(quadsArrayOfPage),
                url: page.url
            });
            this.emit("metadata", { ...treeMetadata.metadata, url: page.url });

            // When there are no tree:relations found, search for a tree:view to continue
            // In this case, we expect that the URL parameter provided contains a tree collection's URI
            if (!treeMetadata.metadata.treeMetadata.relations.size && treeMetadata.metadata.treeMetadata.collections.get(pageUrl) && treeMetadata.metadata.treeMetadata.collections.get(pageUrl)["view"]) {
                const view = treeMetadata.metadata.treeMetadata.collections.get(pageUrl)["view"][0]["@id"]; // take first view encountered
                this.bookkeeper.addFragment(view, 0);
            }

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
                        // do not add when synchronization is disabled and node has already been processed
                        if (!this.disableSynchronization || (this.disableSynchronization && !this.processedURIs.has(node['@id']))) {
                            this.bookkeeper.addFragment(node['@id'], 0);
                        }
                    }
                }
            }

            const memberUris: string[] = this.getMemberUris(treeMetadata);
            const members = this.getMembers(quadsArrayOfPage, memberUris);

            await this.processMembers(members);
        } catch (e) {
            this.log('error', `Failed to retrieve ${pageUrl}`, e);
        }
    }

    protected * getMembers(quads: RDF.Quad[], memberUris: string[]): Generator<IMember> {
        const subjectIndex: Record<string, RDF.Quad[]> = {};
        for (const quad of quads) {
            const subject = quad.subject.value;
            if (!subjectIndex[subject]) {
                subjectIndex[subject] = [quad];
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

            if (!this.dereferenceMembers) {
                const done = new Set(memberUris);
                yield this.extractMember(memberUri, subjectIndex, done);
            } else {
                const quads = new MemberIterator(memberUri, this.rateLimiter);
                quads.on('error', (msg, e) => {
                    this.log('error', msg, e);
                })
                yield {
                    uri: memberUri,
                    quads: quads,
                } as IMember;
            }
        }
        return result;
    }

    protected extractMember(memberUri: string, subjectIndex: Record<string, RDF.Quad[]>, done: Set<string>): IMember {
        const queue: string[] = [memberUri];
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

    protected async processMembers(members: Generator<IMember>) {
        let factory = new DataFactory();
        for (const member of members) {
            const id = member.uri;
            const quadStream = member.quads;

            try {
                //If representation is set, let’s return the data without serialization, but in the requested representation (Object or Quads)
                if (this.representation) {
                    //Can be "Object" or "Quads"
                    if (this.representation === 'Object') {
                        let framedResult = (await this.mediators.mediatorRdfFrame.mediate({
                            data: quadStream,
                            frames: [{ "@id": id }],
                            jsonLdContext: this.jsonLdContext
                        })).data;
                        let firstEntry = framedResult.entries().next();
                        this.push({ "id": firstEntry.value[0]["@id"], object: firstEntry.value[1] });
                    } else {
                        //Build an array from the quads iterator
                        let quadArray: Array<Quad> = [];
                        quadStream.forEach((item) => {
                            quadArray.push(item);
                        });
                        quadStream.on('end', () => {
                            let _member: Member = {
                                id: factory.namedNode(member.uri),
                                quads: quadArray
                            };
                            this.push(_member);
                        });
                    }
                } else {
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
                }
            } catch (error) {
                this.log("error", `Failed to process member ${id}`, error);
            }
        };
    }

    protected getPage(pageUrl: string): Promise<PageMetadata> {
        return new Promise((resolve, reject) => {
            const protocol = new URL(pageUrl).protocol;
            let r = protocol === 'https:' ? cacheableRequestHttps : cacheableRequestHttp;

            const options = {
                ...urlLib.parse(pageUrl),
                headers: {
                    Accept: 'application/ld+json', // TODO: make configurable
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
