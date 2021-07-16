import { ActorInit, IActionInit, IActorOutputInit } from "@comunica/bus-init/lib/ActorInit";
import { Actor, IAction, IActorArgs, IActorTest, Mediator } from "@comunica/core";
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
import { IActionRdfFilterObject, IActorRdfFilterObjectOutput } from "../../bus-rdf-filter-object";
import { IActionRdfFrame, IActorRdfFrameOutput } from "../../bus-rdf-frame";
import {
    IActionSparqlSerializeHandle,
    IActorOutputSparqlSerializeHandle,
    IActorTestSparqlSerializeHandle
} from "@comunica/bus-sparql-serialize";
import { IActorQueryOperationOutputQuads } from "@comunica/bus-query-operation";

import * as f from "@dexagod/rdf-retrieval";
import { AsyncIterator } from "asynciterator";
import { Frame } from "jsonld/jsonld-spec";

export interface IEventStreamArgs {
    pollingInterval?: number,
    mimeType?: string,
    jsonLdContext?: ContextDefinition,
    fromTime?: Date,
    emitMemberOnce?: boolean,
    disablePolling?: boolean,
}

export interface IEventStreamMediators {
    mediatorRdfMetadataExtractTree: Mediator<ActorRdfMetadataExtract,
        IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;

    mediatorRdfParse: Mediator<Actor<IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>,
        IActionHandleRdfParse, IActorTestHandleRdfParse, IActorOutputHandleRdfParse>;

    mediatorRdfFilterObject: Mediator<Actor<IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>,
        IActionRdfFilterObject, IActorTest, IActorRdfFilterObjectOutput>;

    mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>,
        IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;

    mediatorRdfSerialize: Mediator<Actor<IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>,
        IActionSparqlSerializeHandle, IActorTestSparqlSerializeHandle, IActorOutputSparqlSerializeHandle>;
}

export class EventStream extends Readable {
    protected readonly mediators: IEventStreamMediators;

    protected pollingInterval?: number;
    protected mimeType?: string;
    protected jsonLdContext?: ContextDefinition;
    protected emitMemberOnce: boolean;
    protected fromTime?: Date;
    protected disablePolling?: boolean;
    protected accessUrl: string;

    protected processedURIs: Set<string>;
    protected bookie: Bookkeeper;

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

        this.processedURIs = new Set();
        this.bookie = new Bookkeeper();

        this.retrieve(this.accessUrl);
    }

    public _read() {
        // Do nothing
    }

    protected log(msg: string) {
        // Fixme: use normal logging library
        console.info(msg);
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

            const members: string[] = this.getMembers(treeMetadata);

            this.processMembers(members, quadsArrayOfPage);
            this.retrieveRecursively();
        } catch (e) {
            this.log('Failed to retrieve ' + pageUrl + ': ' + e);
            this.retrieveRecursively();
        }
    }

    private async processMembers(members: string[], quadsArrayOfPage: RDF.Quad[]) {
        // Get prov:generatedAtTime of members
        const memberToGeneratedAtTime = await this.mapMembersToGeneratedAtTime(quadsArrayOfPage, members);

        let membersToProcess: string[] = [];
        for (let member of members) {
            // Only process member when its prov:generatedAtTime is higher
            if (!this.fromTime || (memberToGeneratedAtTime[member].getTime() >= this.fromTime.getTime())) {
                // Process if LRU Cache doesn't recognize
                // Or when it is configured that members may be emitted multiple times
                // Otherwise don't process the member
                if (!this.processedURIs.has(member) || !this.emitMemberOnce) {
                    this.processedURIs.add(member);
                    membersToProcess.push(member);
                }
            }
        }

        // Filter the quads that are relevant for each member
        const quadstreamPerMember = (await this.mediators.mediatorRdfFilterObject.mediate({
            data: await this.quadArrayToQuadStream(quadsArrayOfPage),
            objectURIs: membersToProcess,
            constraints: undefined
        })).data; // Map<string, RDF.Stream>

        // Serialize back into string
        for (let [id, memberQuadStream] of quadstreamPerMember.entries()) {
            let outputString;
            if (this.mimeType != "application/ld+json") {
                const handle: IActorQueryOperationOutputQuads = {
                    type: "quads",
                    quadStream: memberQuadStream as RDF.Stream & AsyncIterator<RDF.Quad>
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
                    data: memberQuadStream,
                    frames: [frame],
                    jsonLdContext: this.jsonLdContext
                })).data;
                outputString = JSON.stringify(framedObjects.get(frame));
            }
            this.push(`${outputString}\n`);
        };

    }

    private async retrieveRecursively() {
        if (this.bookie.nextFragmentExists()) {
            let next = this.bookie.getNextFragmentToFetch();
            let now = new Date();
            // Do not refetch too soon
            while (next.refetchTime.getTime() > now.getTime()) {
                await this.sleep(FETCH_PAUSE);
                this.log("Waiting " + (next.refetchTime - now.getTime()) / 1000 + "s before refetching: " + next.url);
                now = new Date();
            }
            this.retrieve(next.url);
        } else {
            this.log("done")
            // We're done
            this.push(null);
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
    protected getMembers(treeMetadata: any): string[] {
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
