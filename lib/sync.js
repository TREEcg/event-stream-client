const FETCH_PAUSE = 2000; // in milliseconds; pause before fetching the next fragment

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
const { http, https } = followRedirects;
const CacheableRequest = require('cacheable-request');
const cacheableRequest = new CacheableRequest(http.request);

const rdfParser = require("rdf-parse").default;
const N3 = require('n3');
const streamWriter = new N3.StreamWriter({ prefixes: { tree: 'https://w3id.org/tree#' } });

const Bookkeeper = require('./bookkeeper');

let bk;
let url;

function createReadStream (options) {
    let bookkeeperOptions = {
        "pollingInterval": options.pollingInterval
    };
    bk = new Bookkeeper(bookkeeperOptions);
    retrieve(options.url);

    return streamWriter;
}

async function retrieve(pageUrl) {
    console.error('GET ' + pageUrl);
    let startTime = new Date();
    try {
        let page = await getPage(pageUrl);
        let endTime = new Date();
        let isFromCache = page.fromCache;

        if (isFromCache) {
            console.error('' + page.statusCode + ' ' + pageUrl + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
            // page.url is undefined when coming from client-side cache
            // our cache control strategy is not sufficient, use default strategy
            bk.addFragmentWithoutCacheControl(pageUrl);
            retrieveRecursively();
        } else {
            console.error('' + page.statusCode + ' ' + page.url + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
            bk.addFragmentWithCacheControl(page.url, page.headers);

            // parse RDF triples
            let dataStream = require('streamify-string')(page.data.toString());

            // only keep media-type directive of content-type header
            let mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];
            rdfParser.parse(dataStream, {contentType: mediaType})
                .on('data', (quad) => {
                    streamWriter.write(quad);
                    //readStream.push(quad.toString())
                    let predicateValue = quad.predicate.value;
                    if (predicateValue === "https://w3id.org/tree#node") {
                        let newFragment = quad.object.value;
                        // later: add relation metadata so the bookkeeper can prune
                        bk.addFragmentWithoutCacheControl(newFragment);
                    }
                })
                .on('error', (error) => console.error(error))
                .on('end', () => retrieveRecursively());
        }
    } catch (e) {
        console.error('Failed to retrieve ' + pageUrl + ': ' + e);
    }
}

async function retrieveRecursively() {
    await sleep(FETCH_PAUSE);
    if (bk.nextFragmentExists()) {
        let next = bk.getNextFragmentToFetch();
        let now = new Date();
        // Do not refetch too soon
        while (next.refetchTime.getTime() > now.getTime()) {
            await sleep(FETCH_PAUSE);
            now = new Date();
        }
        retrieve(next.url);
    } else {
        readStream.push(null);
    }
}

function getPage(pageUrl) {
    return new Promise((resolve, reject) => {
        const cacheReq = cacheableRequest(pageUrl, (res) => {
            let data = '';

            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
                resolve({
                    "url": res.responseUrl,
                    "data": data,
                    "headers": res.headers,
                    "statusCode": res.statusCode,
                    "fromCache": res.fromCache
                });
            })
        })

        cacheReq.on('request', req => req.end());
        cacheReq.on('error', (e) => reject(e));
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = sync = { createReadStream };
