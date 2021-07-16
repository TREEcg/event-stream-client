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

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;

import { ContextDefinition } from "jsonld";

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
import { EventStream, IEventStreamArgs } from "./EventStream";

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
    public emitMemberOnce: boolean;
    public fromTime?: Date;
    public disablePolling: boolean;

    public constructor(args: ILDESClientArgs) {
        super(args);
    }

    public async test(action: IActionInit): Promise<IActorTest> {
        return true;
    }

    public async run(action: IActionInit): Promise<IActorOutputInit> {
        const args = minimist(action.argv);
        if (args["_"].length) {
            return { stderr: require('streamify-string')(<Error>new Error(LDESClient.HELP_MESSAGE)) }
        }

        const pollingInterval: number = args.pollingInterval ? parseInt(args.pollingInterval) : this.pollingInterval;
        const mimeType: string = args.mimeType ? args.mimeType : this.mimeType;

        const options: IEventStreamArgs = {
            pollingInterval, 
            mimeType,
        };

        if (args.context && existsSync(args.context)) {
            options.jsonLdContext = JSON.parse(readFileSync(args.context, 'utf8'));
        }

        if (args.fromTime && moment(args.fromTime).isValid()) {
            options.fromTime = new Date(args.fromTime);
        }

        if (args.disablePolling) {
            if (typeof args.disablePolling == "boolean") {
                options.disablePolling = args.disablePolling;
            }
            else {
                options.disablePolling = args.disablePolling.toLowerCase() == 'true' ? true : false;
            }
        }

        const url = args._[args._.length - 1];
        const eventStream = this.createReadStream(url, options);
        return { 'stdout': eventStream };
    }

    public createReadStream(url: string, options: IEventStreamArgs) {
        if (!options.pollingInterval) {
            options.pollingInterval = this.pollingInterval;
        }
        if (!options.mimeType) {
            options.mimeType = this.mimeType;
        }
        if (!options.jsonLdContext) {
            if (this.jsonLdContextPath.length > 0) {
                options.jsonLdContext = JSON.parse(readFileSync(this.jsonLdContextPath, 'utf8'));
            } else {
                options.jsonLdContext = JSON.parse(this.jsonLdContextString);
            }
        }
        if (typeof options.emitMemberOnce != "boolean") {
            options.emitMemberOnce = this.emitMemberOnce;
        }
        if (!options.fromTime) {
            options.fromTime = this.fromTime;
        }
        if (typeof options.disablePolling != "boolean") {
            options.disablePolling = this.disablePolling;
        }

        const mediators = {
            mediatorRdfMetadataExtractTree: this.mediatorRdfMetadataExtractTree,
            mediatorRdfParse: this.mediatorRdfParse,
            mediatorRdfFilterObject: this.mediatorRdfFilterObject,
            mediatorRdfFrame: this.mediatorRdfFrame,
            mediatorRdfSerialize: this.mediatorRdfSerialize,
        };
        
        return new EventStream(url, mediators, options);
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
    fromTime?: Date;
}