import { ActionContext, Actor, IActorTest, Mediator } from "@comunica/core";
import {
    IActionRdfMetadataExtract,
    IActorRdfMetadataExtractOutput,
    ActorRdfMetadataExtract
} from '@comunica/bus-rdf-metadata-extract';
import { MediatorRdfParseHandle } from "@comunica/bus-rdf-parse";
import { MediatorRdfSerializeHandle } from '@comunica/bus-rdf-serialize';
import { IActionRdfFrame, IActorRdfFrameOutput } from "@treecg/bus-rdf-frame";
import { Member, Logger } from "@treecg/types";
import { Readable as StreamReadable } from 'stream';
import { Readable } from 'readable-stream';
import { AsyncIterator, ArrayIterator, EmptyIterator } from "asynciterator";
import { Frame } from "jsonld/jsonld-spec";
import { inspect } from 'util';
import { DataFactory } from 'rdf-data-factory';
import { JsonLdDocument } from "jsonld";
import { Quad, Store } from "n3";
import LRU from 'lru-cache';
import * as ContentType from 'content-type';
import * as CachePolicy from 'http-cache-semantics';
import * as moment from 'moment';
import * as RDF from 'rdf-js';
import * as RdfString from "rdf-string";
import { Bookkeeper, SerializedBookkeper } from './Bookkeeper';
import RateLimiter from "./RateLimiter";
import MemberIterator from "./MemberIterator";
import { stream2Array, stream2String } from "./Utils";

export class EventStream extends Readable {
    protected readonly mediators: IEventStreamMediators;

    protected readonly factory: RDF.DataFactory;

    protected readonly pollingInterval?: number;
    protected readonly representation?: OutputRepresentation;
    protected readonly requestHeaders?: { [key: string]: number | string | string[] };
    protected readonly mimeType?: string;
    protected readonly jsonLdContext?: JsonLdDocument;
    protected readonly emitMemberOnce?: boolean;
    protected readonly fromTime?: Date;
    protected readonly fromTimeStrict?: boolean;
    protected readonly disableSynchronization?: boolean;
    protected readonly disableFraming?: boolean;
    protected readonly dereferenceMembers?: boolean;
    protected readonly accessUrl: string;
    protected readonly logger: Logger;
    protected readonly processedURIsCount?: number;
    protected readonly bookkeeper: Bookkeeper;
    protected readonly rateLimiter: RateLimiter;
    protected processedURIs: any;
    protected timeout: any;

    private downloading: boolean;
    private syncingmode: boolean;
    private paused: boolean = false;


    public constructor(
        url: string,
        mediators: IEventStreamMediators,
        args: IEventStreamArgs,
        state: State | null
    ) {
        super({ objectMode: true, highWaterMark: 1000 });

        this.mediators = mediators;
        this.accessUrl = url;
        this.fromTime = args.fromTime;
        this.fromTimeStrict = args.fromTimeStrict;
        this.disableSynchronization = args.disableSynchronization;
        this.disableFraming = args.disableFraming;
        this.pollingInterval = args.pollingInterval;
        this.representation = args.representation;
        this.requestHeaders = args.requestHeaders;
        this.mimeType = args.mimeType;
        this.jsonLdContext = args.jsonLdContext;
        this.dereferenceMembers = args.dereferenceMembers;
        this.emitMemberOnce = args.emitMemberOnce;
        this.processedURIsCount = args.processedURIsCount!;
        this.processedURIs = new LRU({ max: this.processedURIsCount });
        this.bookkeeper = new Bookkeeper();
        this.logger = new Logger(this, args.loggingLevel);
        this.downloading = false;
        this.syncingmode = false;
        if (args.requestsPerMinute) {
            this.rateLimiter = new RateLimiter(60000. / args.requestsPerMinute);
        } else {
            this.rateLimiter = new RateLimiter(0);
        }
        if (state != null) {
            this.importState(state);
        } else {
            this.bookkeeper.addFragment(this.accessUrl, 0);
        }
        this.factory = new DataFactory()!;

    }

    private async fetchNextPage() {
        this.downloading = true;
        const next = this.bookkeeper.getNextFragmentToFetch();
        const wait = next.refetchTime.getTime() - new Date().getTime();
        // Do not refetch too soon
        if (wait > 0) {
            this.logger.debug(`Waiting ${wait / 1000}s before refetching: ${next.url}`);
            await this.sleep(wait);
        }
        // Retrieve data
        await this.retrieve(next.url);
        this.downloading = false;
        this.emit('page processed', next.url);
        this._read();
    }

    public async _read() {
        try {
            if (!this.downloading && this.paused) {
                // Reading process has been externally paused
                super.pause();
            } else if (!this.downloading && !this.paused && this.bookkeeper.nextFragmentExists()) {
                // Reading process is not paused, is not downloading new data and there is more data available
                if (!this.disableSynchronization && this.bookkeeper.inSyncingMode() && !this.syncingmode) {
                    // We have reached the most recent fragment and synchronization is enabled
                    this.syncingmode = true;
                    this.emit('synchronizing');
                    if (!this.downloading && this.paused) {
                        super.pause();
                    }
                } else {
                    // Proceed and fetch more data
                    await this.fetchNextPage();
                }
            } else if (!this.downloading) {
                //end of the stream
                this.logger.debug("done");
                this.push(null);
            }
        } catch (err) {
            this.logger.error(inspect(err));
        }
    }

    protected sleep(ms: number) {
        return new Promise(resolve => {
            this.timeout = setTimeout(resolve, ms);
        });
    }

    public pause(): this {
        this.paused = true;
        return this;
    }

    public resume(): this {
        this.paused = false;
        super.resume();
        return this
    }

    public destroy(): this {
        // Properly close the stream by clearing any pending tasks
        clearTimeout(this.timeout);
        super.destroy();
        return this;
    }

    public ignorePages(urls: string[]) {
        for (const url of urls) {
            this.bookkeeper.blacklistFragment(url);
        }
    }

    public exportState(): State {
        if (!this.isPaused() && !this.readableEnded) {
            throw new Error('Cannot export state while stream is not paused or ended');
        }
        let memberBuffer: any = [];
        while (this.readableLength > 0) {
            let member = this.read();
            if (this.representation === OutputRepresentation.Quads) {
                if (member !== null) {
                    let quads = [];
                    for (const quad of member.quads) {
                        quads.push(RdfString.quadToStringQuad(quad));
                    }
                    memberBuffer.push({ id: member.id, quads: quads });
                }
            } else {
                memberBuffer.push(member);
            }
        }
        return {
            bookkeeper: this.bookkeeper.serialize(),
            memberBuffer: JSON.stringify(memberBuffer),
            processedURIs: JSON.stringify(this.processedURIs.dump()),
        };
    }

    public isBuffering(): boolean {
        return this.downloading;
    }

    public importState(state: State) {
        this.bookkeeper.deserialize(state.bookkeeper);

        if (state.memberBuffer != undefined && JSON.parse(state.memberBuffer) != null) {
            if (this.representation === OutputRepresentation.Quads) {
                let internalBuffer = JSON.parse(state.memberBuffer);
                for (const member of internalBuffer) {
                    let quads = [];
                    for (const quad of member.quads) {
                        quads.push(RdfString.stringQuadToQuad(quad));
                    }
                    let _member: Member = { id: member.id, quads: quads };
                    super.unshift(_member);
                }
            } else {
                for (const member of JSON.parse(state.memberBuffer)) {
                    super.unshift(member);
                }
            }
        }

        this.processedURIs = new LRU({ max: this.processedURIsCount! });
        this.processedURIs.load(JSON.parse(state.processedURIs));
    }

    protected async retrieve(pageUrl: string) {
        this.logger.debug(`GET ${pageUrl}`);
        const startTime = new Date();

        await this.rateLimiter.planRequest(pageUrl);

        try {
            // TODO: Perform data fetching with Comunica RDF dereference actors
            const page = await this.getPage(pageUrl);
            this.logger.debug(`${page.statusCode} ${page.url} (${new Date().getTime() - startTime.getTime()}) ms`);

            // Remember that the fragment has been retrieved
            this.processedURIs.set(pageUrl, {});
            // can be a redirected response <> pageUrl
            this.processedURIs.set(page.url, {});

            // Retrieve media type
            // TODO: Fetch mediaType by using response and a Comunica actor
            const mediaType = page.contentType;

            if (!this.disableSynchronization && this.pollingInterval) {
                // Based on the HTTP Caching headers, poll this fragment for synchronization
                // If options.shared is false, then the response is evaluated from a perspective of a single-user cache 
                // (i.e. private is cacheable and s-maxage is ignored)
                const policy = new CachePolicy(page.request, page.response, { shared: false });
                // pollingInterval is fallback
                const ttl = Math.max(this.pollingInterval, policy.storable() ? policy.timeToLive() : 0);
                this.bookkeeper.addFragment(page.url, ttl);
                this.logger.debug(`Scheduled page (${page.url}) for polling in ${ttl / 1000} seconds`);
            }

            const context = new ActionContext({});

            // Get the array of quads fetched from a page
            const pageQuads = await stream2Array<RDF.Quad>(
                (await this.mediators.mediatorRdfParseHandle.mediate({
                    context: context,
                    handle: {
                        context: context,
                        data: page.data,
                        metadata: { baseIRI: page.url }
                    }, handleMediaType: mediaType
                })).handle.data
            );

            // Extract TREE metadata
            const treeMetadata = await this.mediators.mediatorRdfMetadataExtract.mediate({
                context: new ActionContext({}),
                requestTime: 0,
                metadata: StreamReadable.from(pageQuads),
                url: page.url
            });

            this.emit("metadata", { ...treeMetadata.metadata, url: page.url });

            // When there are no tree:relations found, search for a tree:view to continue
            // In this case, we expect that the URL parameter provided contains a tree collection's URI
            if (!treeMetadata.metadata.treeMetadata.relations.size) {
                // Page URL should be a collection URI
                // Check the URL with and without www
                const pageUrlWithoutWWW = pageUrl.replace('://www.', '://');

                /**
                 * TODO: There is an issue with the TREE metadata extractor
                 * changing the casing of the LDES IRI e.g.:
                 *    https://semiceu.github.io/LinkedDataEventStreams/example.ttl#eventstream
                 * gets changed to:
                 *    https://semiceu.github.io/linkeddataeventstreams/example.ttl#eventstream
                 * which prevents tree:views to get booked
                 */

                if (treeMetadata.metadata.treeMetadata.collections.get(pageUrl)
                    && treeMetadata.metadata.treeMetadata.collections.get(pageUrl)["view"]) {
                    // take first view encountered
                    const view = treeMetadata.metadata.treeMetadata.collections.get(pageUrl)["view"][0]["@id"];
                    this.bookkeeper.addFragment(view, 0);
                    this.logger.debug(`Scheduled TREE view (${view}) for retrieval`);
                } else if (treeMetadata.metadata.treeMetadata.collections.get(pageUrlWithoutWWW)
                    && treeMetadata.metadata.treeMetadata.collections.get(pageUrlWithoutWWW)["view"]) {
                    // take first view encountered
                    const view = treeMetadata.metadata.treeMetadata.collections.get(pageUrlWithoutWWW)["view"][0]["@id"];
                    this.bookkeeper.addFragment(view, 0);
                    this.logger.debug(`Scheduled TREE view (${view}) for retrieval`);
                }
            }

            // Process TREE relations towards other nodes
            for (const [_, relation] of treeMetadata.metadata.treeMetadata.relations) {
                if (relation.value && this.fromTime && relation["@type"][0] && moment(relation.value[0]["@value"]).isValid()) {
                    const value = relation.value[0]["@value"];

                    // To be enhanced when more TREE filtering capabilities are available
                    const valueDate = new Date(value);

                    // Prune when the value of the relation contain values lower than what we need
                    if (relation["@type"][0] === "https://w3id.org/tree#LessThanRelation"
                        && valueDate.getTime() <= this.fromTime.getTime()) { }
                    // Prune when the value of the relation includes values lower than what we need
                    // and we want explicitly (fromTimeStrict) values larger than the given threshold (fromTime)
                    else if (relation["@type"][0] === "https://w3id.org/tree#GreaterThanOrEqualToRelation"
                        && valueDate.getTime() <= this.fromTime.getTime()
                        && this.fromTimeStrict) { }
                    else {
                        // Add node to book keeper with ttl 0 (as soon as possible)
                        for (const node of relation.node) {
                            // do not add when synchronization is disabled and node has already been processed
                            if (!this.disableSynchronization || (this.disableSynchronization && !this.processedURIs.has(node['@id']))) {
                                this.bookkeeper.addFragment(node['@id'], 0);
                                this.logger.debug(`Scheduled TREE node (${node['@id']}) for retrieval`);
                            }
                        }
                    }
                } else {
                    // Add node to book keeper with ttl 0 (as soon as possible)
                    for (const node of relation.node) {
                        // do not add when synchronization is disabled and node has already been processed
                        if (!this.disableSynchronization || (this.disableSynchronization && !this.processedURIs.has(node['@id']))) {
                            this.bookkeeper.addFragment(node['@id'], 0);
                            this.logger.debug(`Scheduled TREE node (${node['@id']}) for retrieval`);
                        }
                    }
                }
            }

            const memberUris: string[] = this.getMemberUris(treeMetadata);
            const members = this.getMembers(pageQuads, memberUris);

            await this.processMembers(members);
        } catch (e) {
            this.logger.error(`Failed to retrieve ${pageUrl}
${inspect(e)}`);
        }
    }

    protected async getPage(pageUrl: string): Promise<PageMetadata> {
        try {
            const req = {
                headers: {
                    'Accept': 'application/ld+json',
                    ...this.requestHeaders
                }
            }

            // Use native fetch to get page data
            const res = await fetch(pageUrl, req);

            // Extract response headers
            const resHeaders: Array<[string, string]> = [];
            res.headers.forEach((v, k) => resHeaders.push([k, v]));
            const trailingCharacterRegex = /;$/;
            let contentType = <string>res.headers.get('content-type');
            if (contentType) {
                contentType = contentType.trim().replace(trailingCharacterRegex, ''); // Just removing some clutter
            } else {
                contentType = "";
            }
            return <PageMetadata>{
                url: res.url,
                request: req,
                response: { status: res.status, headers: Object.fromEntries(resHeaders) },
                statusCode: res.status,
                data: StreamReadable.fromWeb(<any>res.body?.pipeThrough(<any>new TextDecoderStream())),
                contentType: ContentType.parse(contentType).type
            };
        } catch (err) {
            this.logger.error(inspect(err));
            throw err;
        }
    }

    // Returns array of memberURI (string) -> immutable (boolean)
    protected getMemberUris(treeMetadata: any): string[] {
        const members: string[] = [];
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

    protected * getMembers(quads: RDF.Quad[], memberUris: string[]): Generator<IMember> {
        // Load quads into a RDF-JS store for easier BGP lookups
        const store = new Store(quads);
        const result: Record<string, AsyncIterator<RDF.Quad>> = {};
        // Get ldes:timestampPath
        const timestampPath = this.extractTimestampPath(store);
        // Yield flag
        let yielded = false;

        for (const memberUri of memberUris) {
            // Get all quads of member
            const memberQuads: RDF.Quad[] = store.getQuads(memberUri, null, null, null);

            // Check member's timestamp and skip if required
            if (this.fromTime && timestampPath) {
                const eventTime = this.extractEventTime(memberQuads, timestampPath);
                if (!eventTime || eventTime < this.fromTime) {
                    continue;
                }
            }

            if (this.emitMemberOnce && this.processedURIs.has(memberUri)) {
                // This event has already been emitted
                continue;
            }

            this.processedURIs.set(memberUri, {});

            if (!this.dereferenceMembers) {
                let processedSubjects: Set <string> = new Set();
                const memberQuads = this.extractMember(store, this.factory.namedNode(memberUri), processedSubjects, memberUris);
                const memberQuadStream = StreamReadable.from(memberQuads);
                yield {
                    uri: memberUri,
                    quads: new ArrayIterator(memberQuads)
                };
            } else {
                const quads = new MemberIterator(memberUri, this.rateLimiter);
                quads.on('error', (msg, e) => {
                    this.logger.error(msg + '\n' + inspect(e));
                })
                yield {
                    uri: memberUri,
                    quads: quads,
                } as IMember;
            }
            yielded = true;
        }
        // Handle the case where no Members are eligible to be emitted
        if (!yielded) {
            yield {
                uri: '',
                quads: new EmptyIterator()
            }
        }
        return result;
    }

    protected extractTimestampPath(store: Store): RDF.Quad_Object | undefined {
        // TODO: This should be done in a dedicated Comunica actor that extracts all LDES-related metadata
        // Determine ldes:timestampPath predicate
        const quad = store.getQuads(null, 'https://w3id.org/ldes#timestampPath', null, null)[0]
        if (quad) {
            return quad.object;
        }
    }

    protected extractEventTime(quads: RDF.Quad[], timestampPath: RDF.Quad_Object): Date | undefined {
        const memberStore = new Store(quads);
        const timestampQuad = memberStore.getQuads(null, timestampPath.value, null, null)[0];

        if (timestampQuad) {
            return new Date(timestampQuad.object.value);
        }
    }

    protected extractMember(store: Store, id: RDF.Term, processedSubjects: Set<string>, memberUris: string[]): Quad[] {
        let member: Quad[] = [];
        processedSubjects.add(id.value);
        const forwardQuads = store.getQuads(id,null,null,null);
        //const inverseQuads = store.getQuads(null,null,id,null);
        //console.log(id, forwardQuads,inverseQuads);

        for (const q of forwardQuads) {
            if (!member.includes(q) && !processedSubjects.has(q.object.value)) { 
                member.push(q);
                if (q.object.termType !== 'Literal' && !memberUris.includes(q.object.value)) {
                    member = member.concat(this.extractMember(store, q.object, processedSubjects, memberUris));
                }
            }
        }
        /*for (let q of inverseQuads) {
            if (q.predicate.value !== 'https://w3id.org/tree#member' && !memberUris.includes(q.subject.value) && !processedSubjects.has(q.subject.value)) {
                member.push(q); //also relevant triple that needs to be added
                member = member.concat(this.extractMember(store, q.subject, processedSubjects, memberUris));
            }
        }*/
        return member
    }
    
    protected async processMembers(members: Generator<IMember>) {

        for (const member of members) {
            const id = member.uri;
            const quadStream = member.quads;
            // Check if member stream is empty
            if (!(quadStream instanceof EmptyIterator)) {
                try {
                    const context = new ActionContext({});
                    // If representation is set, let’s return the data without serialization, 
                    // but in the requested representation (Object or Quads)
                    if (this.representation) {
                        // Can be "Object" or "Quads"
                        if (this.representation === OutputRepresentation.Object) {
                            if (!this.disableFraming) {
                                const framedResult = (await this.mediators.mediatorRdfFrame.mediate({
                                    context: context,
                                    data: quadStream,
                                    frames: [{ "@id": id }],
                                    jsonLdContext: this.jsonLdContext
                                })).data;
                                const firstEntry = framedResult.entries().next();
                                this.push({ "id": firstEntry.value[0]["@id"], object: firstEntry.value[1] });
                            } else {
                                const result = JSON.parse(await stream2String(
                                    <StreamReadable>(await this.mediators.mediatorRdfSerializeHandle.mediate({
                                        context: context,
                                        handle: { quadStream: quadStream, context: context },
                                        handleMediaType: "application/ld+json"
                                    })).handle.data));
                                this.push({ "id": result[0]["@id"], object: result });
                            }
                        } else {
                            // Build an array from the quads iterator
                            await new Promise<void>((resolve, reject) => {
                                const quadArray: Array<RDF.Quad> = [];
                                quadStream.on('data', (item) => {
                                    quadArray.push(item);
                                });
                                quadStream.on('end', () => {
                                    let _member: Member = {
                                        id: this.factory.namedNode(member.uri),
                                        quads: quadArray
                                    };
                                    this.push(_member);
                                    resolve();
                                });
                            });
                        }
                    } else {
                        let outputString;
                        if (this.mimeType !== "application/ld+json" || this.disableFraming) {
                            const serializedString = await stream2String(
                                <StreamReadable>(await this.mediators.mediatorRdfSerializeHandle.mediate({
                                    context: context,
                                    handle: { quadStream: quadStream, context: context },
                                    handleMediaType: this.mimeType
                                })).handle.data);

                            if (serializedString) {
                                outputString = serializedString;
                            } else {
                                outputString = '';
                            }
                        } else {
                            // Create framed JSON-LD output
                            const frame = {
                                "@id": id
                            };
                            const framedObjects: Map<Frame, JsonLdDocument> = (await this.mediators.mediatorRdfFrame.mediate({
                                context: context,
                                data: quadStream,
                                frames: [frame],
                                jsonLdContext: this.jsonLdContext
                            })).data;

                            if (framedObjects.get(frame)) {
                                outputString = JSON.stringify(framedObjects.get(frame));
                            } else {
                                outputString = '';
                            }
                        }
                        this.push(`${outputString}\n`);
                    }
                } catch (error) {
                    this.logger.error(`Failed to process member ${id}
    ${inspect(error)}`);
                }
            } else {
                this.push('');
            }
        }
    }
}

interface IMember {
    uri: string,
    quads: RDF.Stream<RDF.Quad> //& AsyncIterator<RDF.Quad> & ArrayIterator<Quad>,
}

interface PageMetadata {
    request: CachePolicy.Request;
    response: CachePolicy.Response;
    url: string;
    data: StreamReadable;
    statusCode: number;
    contentType: string;
}

export enum OutputRepresentation {
    Quads = "Quads",
    Object = "Object"
}

export interface IEventStreamArgs {
    pollingInterval?: number,
    representation?: OutputRepresentation,
    requestHeaders?: { [key: string]: number | string | string[] },
    mimeType?: string,
    jsonLdContext?: JsonLdDocument,
    fromTime?: Date,
    fromTimeStrict?: boolean,
    emitMemberOnce?: boolean,
    disablePolling?: boolean,
    disableSynchronization?: boolean,
    disableFraming?: boolean,
    dereferenceMembers?: boolean,
    requestsPerMinute?: number,
    loggingLevel?: string,
    processedURIsCount?: number,
}

export interface IEventStreamMediators {
    mediatorRdfMetadataExtract: Mediator<ActorRdfMetadataExtract,
        IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput>;

    mediatorRdfParseHandle: MediatorRdfParseHandle;

    mediatorRdfFrame: Mediator<Actor<IActionRdfFrame, IActorTest, IActorRdfFrameOutput>,
        IActionRdfFrame, IActorTest, IActorRdfFrameOutput>;

    mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;
}

export interface State {
    bookkeeper: SerializedBookkeper;
    memberBuffer: string;
    processedURIs: string;
}
