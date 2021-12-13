import { ActorInit, IActionInit, IActorOutputInit } from "@comunica/bus-init/lib/ActorInit";
import { Actor, IActorArgs, IActorTest, Mediator } from "@comunica/core";
import type {
    IActionRdfMetadataExtract,
    IActorRdfMetadataExtractOutput,
} from '@comunica/bus-rdf-metadata-extract/lib/ActorRdfMetadataExtract';

import * as moment from 'moment';

import minimist = require("minimist");

import { existsSync, readFileSync } from 'fs';

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
import { EventStream, IEventStreamArgs, State } from "./EventStream";
import {isLogLevel, LogLevel} from "./Logger";

export class LDESClient extends ActorInit implements ILDESClientArgs {
    public static readonly HELP_MESSAGE = `actor-init-ldes-client syncs event streams
  Usage:
    actor-init-ldes-client --pollingInterval 5000 https://lodi.ilabt.imec.be/coghent/industriemuseum/objecten

  Options:
    --pollingInterval            Number of milliseconds before refetching uncacheable fragments (e.g., 5000)
    --mimeType                   the MIME type of the output (application/ld+json or text/turtle)
    --context                    path to a file with the JSON-LD context you want to use when MIME type is application/ld+json (e.g., ./context.jsonld)
    --disableSynchronization     whether to disable synchronization or not (by default set to "false", syncing is enabled). Value can be set to "true" or "false"
    --disablePolling             DEPRECATED: use disableSynchronization
    --fromTime                   datetime to prune relations that have a lower datetime value (e.g., 2020-01-01T00:00:00)
    --emitMemberOnce             whether to emit a member only once, because collection contains immutable version objects. Value can be set to "true" or "false"
    --dereferenceMembers         whether to dereference members, because the collection pages do not contain all information. Value can be set to "true" or "false", defaults to "false"
    --requestsPerMinute          How many requests per minutes may be sent to the same host
    --loggingLevel               The detail level of logging; useful for debugging problems. (default: info)
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
    public representation: string;
    public jsonLdContextPath: string;
    public jsonLdContextString: string;
    public emitMemberOnce: boolean;
    public fromTime?: Date;
    public disablePolling: boolean;
    public disableSynchronization: boolean;
    public dereferenceMembers: boolean;
    public requestsPerMinute?: number;
    public loggingLevel: string;

    public constructor(args: ILDESClientArgs) {
        super(args);
    }

    public async test(action: IActionInit): Promise<IActorTest> {
        return true;
    }

    public async run(action: IActionInit): Promise<IActorOutputInit> {
        const args = minimist(action.argv);
        if (!args["_"].length) {
            return { stderr: require('streamify-string')(<Error>new Error(LDESClient.HELP_MESSAGE)) }
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


        const url = args._[args._.length - 1];
        const eventStream = this.createReadStream(url, options);
        return { 'stdout': eventStream };
    }

    public createReadStream(url: string, options: IEventStreamArgs, state: State | null = null) {
        if (!options.pollingInterval) {
            options.pollingInterval = this.pollingInterval;
        }
        //If mimetype is set: output serialized string
        //If mimetype isn’t set, use the in-mem representation if it is set
        //If the representation isn’t set, then just fall back to the standard mimetype
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

        if (typeof options.dereferenceMembers != "boolean") {
            options.dereferenceMembers = this.dereferenceMembers;
        }
        if (!options.requestsPerMinute) {
            options.requestsPerMinute = this.requestsPerMinute;
        }

        options.loggingLevel = this.loggingLevel;

        const mediators = {
            mediatorRdfMetadataExtract: this.mediatorRdfMetadataExtractTree,
            mediatorRdfParse: this.mediatorRdfParse,
            mediatorRdfFrame: this.mediatorRdfFrame,
            mediatorRdfSerialize: this.mediatorRdfSerialize,
        };

        return new EventStream(url, mediators, options, state);
    }
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
    disableSynchronization: boolean;
    dereferenceMembers: boolean;
    fromTime?: Date;
    requestsPerMinute?: number;
}
