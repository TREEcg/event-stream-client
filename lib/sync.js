const FETCH_PAUSE = 2000; // in milliseconds; pause before fetching the next fragment
let pollingInterval = 10000; // in milliseconds; when the response is cacheable, wait this time before refetching it

const followRedirects = require('follow-redirects');
followRedirects.maxRedirects = 10;
const { http, https } = followRedirects;
const CacheableRequest = require('cacheable-request');
const cacheableRequestHttp = new CacheableRequest(http.request);
const cacheableRequestHttps = new CacheableRequest(https.request);
const CachePolicy = require('http-cache-semantics');

const rdfParser = require("rdf-parse").default;
const N3 = require('n3');
const streamWriter = new N3.StreamWriter({ prefixes: { tree: 'https://w3id.org/tree#' } });

const Bookkeeper = require('./bookkeeper');
let bk = new Bookkeeper();

function createReadStream (url, options) {
    if (!url) {
        console.error('Provide a URI of a TREE root node please');
        process.exit();
    }
    if (options && options.pollingInterval) pollingInterval = options.pollingInterval;

    retrieve(url);

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
            // this should never happen, because timeToLive should be expired
            console.error('' + page.statusCode + ' ' + pageUrl + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
            // Add again to book keeper
            // use pageUrl, because page.url is undefined when coming from client-side cache
            bk.addFragment(pageUrl, pollingInterval);
            retrieveRecursively();
        } else {
            console.error('' + page.statusCode + ' ' + page.url + ' (' + (endTime.getTime() - startTime.getTime()) + 'ms)');
            const policy = new CachePolicy(page.request, page.response);
            const ttl = policy.storable() ? policy.timeToLive() : pollingInterval;
            bk.addFragment(page.url, ttl);

            let dataStream = require('streamify-string')(page.data.toString());
            // only keep media-type directive of content-type header
            let mediaType = page.headers['content-type'].indexOf(';') > 0 ? page.headers['content-type'].substr(0, page.headers['content-type'].indexOf(';')) : page.headers['content-type'];
            rdfParser.parse(dataStream, {contentType: mediaType})
                .on('data', (quad) => {
                    streamWriter.write(quad);
                    if (quad.predicate.value === "https://w3id.org/tree#node") {
                        // later: add relation metadata so the bookkeeper can prune
                        bk.addFragment(quad.object.value, 0);
                    }
                })
                .on('error', (error) => console.error(error))
                .on('end', () => retrieveRecursively());
        }
    } catch (e) {
        console.error('Failed to retrieve ' + pageUrl + ': ' + e);
        retrieveRecursively();
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
        // We're done
        streamWriter.push(null);
    }
}

function getPage(pageUrl) {
    return new Promise((resolve, reject) => {
        const protocol = new URL(pageUrl).protocol;
        let r = protocol === 'https:' ? cacheableRequestHttps : cacheableRequestHttp;

        const cacheReq = r(pageUrl, (res) => {
            let data = '';

            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
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

        cacheReq.on('request', request => request.end());
        cacheReq.on('error', (e) => reject(e));
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = sync = { createReadStream };
