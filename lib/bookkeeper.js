const PriorityQueue = require('js-priority-queue');

class Bookkeeper {
    constructor(options) {
        this.queue = new PriorityQueue({ comparator: compareFragments});
        this.queued = {}; // to know whether a fragment URL is already added to the priority queue
    }
}

Bookkeeper.prototype.addFragment = function (url, ttl) {
    if (!Object.keys(this.queued).includes(url)) {
        let fragmentInfo = {
            "url": url,
            "refetchTime": new Date(new Date().getTime() + ttl) // now
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