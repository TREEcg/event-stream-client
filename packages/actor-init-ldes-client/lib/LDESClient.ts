const FETCH_PAUSE = 2000; // in milliseconds; pause before fetching the next fragment
let pollingInterval = 10000; // in milliseconds; when the response is cacheable, wait this time before refetching it

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
const { http, https } = followRedirects;
const CacheableRequest = require('cacheable-request');
const cacheableRequestHttp = new CacheableRequest(http.request);
const cacheableRequestHttps = new CacheableRequest(https.request);
const CachePolicy = require('http-cache-semantics');

import rdfParser from "rdf-parse";
import * as RDF from "rdf-js";
const N3 = require('n3');
const streamWriter = new N3.StreamWriter({ prefixes: { tree: 'https://w3id.org/tree#' } });
const RdfObjectLoader = require("rdf-object").RdfObjectLoader;
const JsonLdSerializer = require("jsonld-streaming-serializer").JsonLdSerializer;
const jsonLdSerializer = new JsonLdSerializer({ space: '  ', context: [
        "https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld",
        "https://data.vlaanderen.be/context/persoon-basis.jsonld",
        "https://brechtvdv.github.io/demo-data/cultureel-erfgoed-event-ap.jsonld",
        {
            "dcterms:isVersionOf": {
"@type": "@id"
},
"prov": "http://www.w3.org/ns/prov#"
}
] });
const {namedNode, literal, triple} = require("@rdfjs/data-model");

//const Bookkeeper = require('./bookkeeper');
import { Bookkeeper } from './Bookkeeper';
let bk = new Bookkeeper();

export class LDESClient {
    public constructor() {
    }

    public createReadStream(url: string, options: { pollingInterval: number; }) {
        if (!url) {
            console.error('Provide a URI of a TREE root node please');
            process.exit();
        }
        if (options && options.pollingInterval) pollingInterval = options.pollingInterval;

        this.retrieve(url);
        return jsonLdSerializer;
        // return streamWriter;
    }

    public async retrieve(pageUrl: string) {
        console.error('GET ' + pageUrl);
        let startTime = new Date();
        try {
            let page = await this.getPage(pageUrl);
            let endTime = new Date();
            let isFromCache = page.fromCache;

            if (isFromCache) {
                // this should never happen, because timeToLive should be expired
                console.error('' + page.statusCode + ' ' + pageUrl + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
                // Add again to book keeper
                // use pageUrl, because page.url is undefined when coming from client-side cache
                bk.addFragment(pageUrl, pollingInterval);
                this.retrieveRecursively();
            } else {
                console.error('' + page.statusCode + ' ' + page.url + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
                const policy = new CachePolicy(page.request, page.response);
                const ttl = policy.storable() ? policy.timeToLive() : pollingInterval;
                bk.addFragment(page.url, ttl);

                let dataStream = require('streamify-string')(page.data.toString());
                // only keep media-type directive of content-type header
                let mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];
                let collectionURI;
                rdfParser.parse(dataStream, {contentType: mediaType})
                    .on('data', (quad: RDF.Quad) => {
                        // streamWriter.write(quad);
                        jsonLdSerializer.write(quad);
                        if (quad.object.value === 'https://w3id.org/tree#Collection') collectionURI = quad.subject.value;
                        if (quad.predicate.value === "https://w3id.org/tree#node") {
                            // later: add relation metadata so the bookkeeper can prune
                            bk.addFragment(quad.object.value, 0);
                        }
                    })
                    .on('error', (error: any) => console.error(error))
                    .on('end', () => {
                        // now we know the collectionURI
                        //getMembers(collectionURI, rdfParser.parse(require('streamify-string')(page.data.toString()), {contentType: mediaType}));
                        this.retrieveRecursively()
                    });
            }
        } catch (e) {
            console.error('Failed to retrieve ' + pageUrl + ': ' + e);
            this.retrieveRecursively();
        }
    }

    /*async function getMembers(collection, parsedStream) {
        const myLoader = new RdfObjectLoader({ context: "https://data.vlaanderen.be/doc/applicatieprofiel/cultureel-erfgoed-object/kandidaatstandaard/2020-07-17/context/cultureel-erfgoed-object-ap.jsonld" }) ;
        myLoader.import(parsedStream).then(() => {
            let members = myLoader.resources[collection].properties['https://w3id.org/tree#member'];
            for (let m in members) {
                // we need to retrieve all quads that are linked with this member
                let member = members[m];
                for (let property in member.properties) {
                    let p = member.properties[property];
                    console.log(property)

                }
                // output quads
                //streamWriter.write(output);
            }

            // Get property values by shortcut
            const myResource = myLoader.resources[collection];
            console.log(`URI:  ${myResource.value}`);
            console.log(`Term type: ${myResource.type}`);
            console.log(`Term value: ${myResource.value}`);
            console.log(`Term: ${myResource.term}`);
        });
    }*/

    public async retrieveRecursively() {
        await this.sleep(FETCH_PAUSE);
        if (bk.nextFragmentExists()) {
            let next = bk.getNextFragmentToFetch();
            let now = new Date();
            // Do not refetch too soon
            while (next.refetchTime.getTime() > now.getTime()) {
                await this.sleep(FETCH_PAUSE);
                now = new Date();
            }
            this.retrieve(next.url);
        } else {
            // We're done
            streamWriter.push(null);
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
                    // This is necessary for cachePolicy
                    res.req.headers = res.headers;
                    resolve({
                        "request": res.req,
                        "response": res,
                        "headers": res.headers,
                        "url": res.responseUrl,
                        "data": data,
                        "statusCode": res.statusCode,
                        "fromCache": res.fromCache
                    });
                })
            })

            cacheReq.on('request', (request : any) => request.end());
            cacheReq.on('error', (e: any) => reject(e));
        });
    }

    public sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
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