import { IActorTest } from "@comunica/core";
import { ActorInit, IActionInit, IActorInitArgs, IActorOutputInit } from "@comunica/bus-init";
import { MediatorRdfParseHandle } from "@comunica/bus-rdf-parse";
import { MediatorRdfMetadataExtract } from '@comunica/bus-rdf-metadata-extract';
import { MediatorRdfFilterObject } from "@treecg/bus-rdf-filter-object";
import { MediatorRdfFrame } from "@treecg/bus-rdf-frame";
import { MediatorRdfSerializeHandle } from "@comunica/bus-rdf-serialize";
import { existsSync, readFileSync } from 'fs';
import * as moment from 'moment';
import * as minimist from 'minimist';
import * as Streamify from 'streamify-string';
import { 
    EventStream, 
    IEventStreamArgs, 
    State, 
    OutputRepresentation 
} from "./EventStream";

import type { Readable } from 'readable-stream';

export class LDESClient extends ActorInit implements ILDESClientArgs {
    public static readonly HELP_MESSAGE = `actor-init-ldes-client syncs event streams
  Usage:
    actor-init-ldes-client --pollingInterval 5000 https://semiceu.github.io/LinkedDataEventStreams/example.ttl

  Options:
    --pollingInterval            Number of milliseconds before refetching non-cacheable fragments (e.g., 5000)
    --mimeType                   the MIME type of the output (application/ld+json or text/turtle)
    --context                    path to a file with the JSON-LD context you want to use when MIME type is application/ld+json (e.g., ./context.jsonld)
    --requestHeadersPath         path to a file with the HTTP request headers you want to use (e.g., ./headers.json)
    --disableSynchronization     whether to disable synchronization or not (by default set to "false", syncing is enabled). Value can be set to "true" or "false"
    --disablePolling             DEPRECATED: use disableSynchronization
    --disableFraming             whether to disable JSON-LD framing when mimeType is application/ld+json or when representation is 'Object' (by default set to "false"). Value can be set to "true" or "false"
    --fromTime                   datetime to prune relations that have a lower datetime value (e.g., 2020-01-01T00:00:00)
    --emitMemberOnce             whether to emit a member only once, because collection contains immutable version objects. Value can be set to "true" or "false"
    --dereferenceMembers         whether to dereference members, because the collection pages do not contain all information. Value can be set to "true" or "false", defaults to "false"
    --requestsPerMinute          How many requests per minutes may be sent to the same host
    --loggingLevel               The detail level of logging; useful for debugging problems. (default: info)
    --processedURIsCount         The maximum number of processed URIs that remain in the cache. (default: 15000)
    --help                       print this help message
  `;

    public readonly mediatorRdfMetadataExtractTree: MediatorRdfMetadataExtract;

    public readonly mediatorRdfParseHandle: MediatorRdfParseHandle;

    public readonly mediatorRdfFilterObject: MediatorRdfFilterObject;

    public readonly mediatorRdfFrame: MediatorRdfFrame;

    public readonly mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;

    public pollingInterval: number;
    public mimeType: string;
    public representation: OutputRepresentation;
    public jsonLdContextPath?: string;
    public jsonLdContextString?: string;
    public requestHeadersPath?: string;
    public requestHeadersString?: string;
    public emitMemberOnce: boolean;
    public fromTime?: Date;
    public disablePolling?: boolean;
    public disableSynchronization: boolean;
    public disableFraming: boolean;
    public dereferenceMembers: boolean;
    public requestsPerMinute?: number;
    public loggingLevel: string;
    public processedURIsCount: number;

    public constructor(args: ILDESClientArgs) {
        super(args);
    }

    public async test(action: IActionInit): Promise<IActorTest> {
        return true;
    }

    public async run(action: IActionInit): Promise<IActorOutputInit> {
        const args = minimist(action.argv);
        if (!args["_"].length) {
            return { stderr: <Readable>Streamify(new Error(LDESClient.HELP_MESSAGE).message) }
        }

        const pollingInterval: number = args.pollingInterval ? parseInt(args.pollingInterval) : this.pollingInterval;
        const mimeType: string = args.mimeType ? args.mimeType : this.mimeType;

        const options: IEventStreamArgs = {
            pollingInterval,
            mimeType
        };

        if (args.context && existsSync(args.context)) {
            options.jsonLdContext = JSON.parse(readFileSync(args.context, 'utf8'));
        }

        if (args.requestHeadersPath && existsSync(args.requestHeadersPath)) {
            options.requestHeaders = JSON.parse(readFileSync(args.requestHeadersPath, 'utf8'));
        }

        if (args.fromTime && moment(args.fromTime).isValid()) {
            options.fromTime = new Date(args.fromTime);
        }

        if (args.emitMemberOnce) {
            if (typeof args.emitMemberOnce == "boolean") {
                options.emitMemberOnce = args.emitMemberOnce;
            } else {
                options.emitMemberOnce = args.emitMemberOnce.toLowerCase() == 'true' ? true : false;
            }
        }

        if (args.disableSynchronization) {
            if (typeof args.disableSynchronization == "boolean") {
                options.disableSynchronization = args.disableSynchronization;
            } else {
                options.disableSynchronization = args.disableSynchronization.toLowerCase() == 'true' ? true : false;
            }
        }

        // disablePolling is saved in disableSynchronization
        if (args.disablePolling) {
            if (typeof args.disablePolling == "boolean") {
                options.disableSynchronization = args.disablePolling;
            } else {
                options.disableSynchronization = args.disablePolling.toLowerCase() == 'true' ? true : false;
            }
        }

        if (args.disableFraming) {
            if (typeof args.disableFraming == "boolean") {
                options.disableFraming = args.disableFraming;
            } else {
                options.disableFraming = args.disableFraming.toLowerCase() == 'true' ? true : false;
            }
        }

        if (args.dereferenceMembers) {
            if (typeof args.dereferenceMembers == "boolean") {
                options.dereferenceMembers = args.dereferenceMembers;
            } else {
                options.dereferenceMembers = args.dereferenceMembers.toLowerCase() == 'true' ? true : false;
            }
        }

        if (args.requestsPerMinute) {
            options.requestsPerMinute = Number.parseInt(args.requestsPerMinute);
        }
        options.loggingLevel = args.loggingLevel ? args.loggingLevel.toLowerCase() : 'info';

        options.processedURIsCount = args.processedURIsCount ? args.processedURIsCount : this.processedURIsCount;

        const url = args._[args._.length - 1];
        const eventStream = this.createReadStream(url, options);
        return { 'stdout': eventStream };
    }

    public createReadStream(url: string, options: IEventStreamArgs, state: State | null = null) {
        if (!options.pollingInterval) {
            options.pollingInterval = this.pollingInterval;
        }
        // If mimetype is set: output serialized string
        // If mimetype isn’t set, use the in-mem representation if it is set
        // If the representation isn’t set, then just fall back to the standard mimetype
        if (!options.mimeType && !options.representation) {
            options.mimeType = this.mimeType;
        }
        if (!options.jsonLdContext) {
            if (this.jsonLdContextPath && this.jsonLdContextPath.length > 0) {
                options.jsonLdContext = JSON.parse(readFileSync(this.jsonLdContextPath, 'utf8'));
            } else if (this.jsonLdContextString) {
                options.jsonLdContext = JSON.parse(this.jsonLdContextString);
            } else {
                options.jsonLdContext = {"@context":{}};
            }
        }
        if (!options.requestHeaders) {
            if (this.requestHeadersPath && this.requestHeadersPath.length > 0) {
                options.requestHeaders = JSON.parse(readFileSync(this.requestHeadersPath, 'utf8'));
            } else if (this.requestHeadersString) {
                options.requestHeaders = JSON.parse(this.requestHeadersString);
            }
        }
        if (typeof options.emitMemberOnce != "boolean") {
            options.emitMemberOnce = this.emitMemberOnce;
        }
        if (!options.fromTime) {
            options.fromTime = this.fromTime;
        }
        // Copy disablePolling (deprecated) to disableSynchronization when only disablePolling is used
        if (!options.disableSynchronization && options.disablePolling)
            options.disableSynchronization = options.disablePolling;

        if (typeof options.disableSynchronization != "boolean") {
            options.disableSynchronization = this.disableSynchronization;
        }
        if (typeof options.disableFraming != "boolean") {
            options.disableFraming = this.disableFraming;
        }
        if (typeof options.dereferenceMembers != "boolean") {
            options.dereferenceMembers = this.dereferenceMembers;
        }
        if (!options.requestsPerMinute) {
            options.requestsPerMinute = this.requestsPerMinute;
        }

        if (!options.loggingLevel) {
            options.loggingLevel = this.loggingLevel;
        }

        if(!options.processedURIsCount) {
            options.processedURIsCount = this.processedURIsCount;
        }

        const mediators = {
            mediatorRdfMetadataExtract: this.mediatorRdfMetadataExtractTree,
            mediatorRdfParseHandle: this.mediatorRdfParseHandle,
            mediatorRdfFrame: this.mediatorRdfFrame,
            mediatorRdfSerializeHandle: this.mediatorRdfSerializeHandle,
        };

        return new EventStream(url, mediators, options, state);
    }
}

export interface ILDESClientArgs extends IActorInitArgs  {
    mediatorRdfMetadataExtractTree: MediatorRdfMetadataExtract,
    mediatorRdfParseHandle: MediatorRdfParseHandle,
    mediatorRdfFilterObject: MediatorRdfFilterObject;
    mediatorRdfFrame: MediatorRdfFrame;
    mediatorRdfSerializeHandle: MediatorRdfSerializeHandle;
    pollingInterval: number;
    mimeType: string;
    jsonLdContextPath?: string;
    jsonLdContextString?: string;
    requestHeadersPath?: string;
    requestHeadersString?: string;
    emitMemberOnce: boolean;
    disablePolling?: boolean;
    disableSynchronization: boolean;
    disableFraming?: boolean;
    loggingLevel?: string;
    processedURIsCount?: number;
    dereferenceMembers: boolean;
    fromTime?: Date;
    requestsPerMinute?: number;
}
