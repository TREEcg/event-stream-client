let pollingInterval; // in milliseconds; when the response does not indicate when to refetch, wait this time before refetching it

const PriorityQueue = require('js-priority-queue');
const { parse } = require('@tusbar/cache-control')

class Bookkeeper {
    constructor(options) {
        pollingInterval = options.pollingInterval || 5000;
        this.queue = new PriorityQueue({ comparator: compareFragments});
        this.queued = {}; // to know whether a fragment URL is already added to the priority queue
    }
}

Bookkeeper.prototype.addFragmentWithCacheControl = function (url, headers) {
    try {
        // based on caching headers we will decide whether this needs to be refetched later or not
        // When 'immutable', do not store
        // When 'max-age', calculate when this will expire
        // When conditional (like E-tag), add WAIT_WHEN_UNKNOWN to now
        if (!Object.keys(this.queued).includes(url)) {
            let cacheControl = parse(headers['cache-control']);
            if (cacheControl.immutable) {
                // do not add to queue
            } else if (cacheControl.maxAge) {
                let fragmentInfo = {
                    "url": url,
                    "cacheControl": cacheControl,
                    "refetchTime": new Date(new Date(headers.date).getTime() + cacheControl.maxAge*1000)
                }
                this.queue.queue(fragmentInfo);
                this.queued[url] = {};
            } else {
                let fragmentInfo = {
                    "url": url,
                    "refetchTime": new Date(new Date().getTime() + pollingInterval)
                }
                this.queue.queue(fragmentInfo);
                this.queued[url] = {};
            }
        }
    } catch (e) {
        console.error('Failed to add ' + url + ': ' + e);
    }
}

Bookkeeper.prototype.addFragmentWithoutCacheControl = function (url) {
    if (!Object.keys(this.queued).includes(url)) {
        let fragmentInfo = {
            "url": url,
            "refetchTime": new Date() // now
        }
        this.queue.queue(fragmentInfo);
        this.queued[url] = {};
    }
}

function compareFragments(a, b) {
    return a.refetchTime.getTime() - b.refetchTime.getTime();
};

Bookkeeper.prototype.nextFragmentExists = function() {
    return this.queue.length > 0 ? true : false;
}

Bookkeeper.prototype.getNextFragmentToFetch = function() {
    let next = this.queue.dequeue();
    delete this.queued[next.url];
    return next;
}

module.exports = Bookkeeper;