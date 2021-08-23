const PriorityQueue = require('js-priority-queue');
const LRU = require("lru-cache");

export class Bookkeeper {
    protected readonly queue = new PriorityQueue({ comparator: compareFragments});
    protected readonly queued: any = new LRU({
        max: 500,
        maxAge: 1000 * 60 * 60 * 24
    }); // to know whether a fragment URL is already added to the priority queue
    protected readonly blacklist: Set<string> = new Set();

    public constructor() {

    }

    public fragmentAlreadyAdded(url: string) {
        return this.queued.has(url);
    }

    public fragmentIsBlacklisted(url: string) {
        return this.blacklist.has(url);
    }

    public blacklistFragment(url: string) {
        this.blacklist.add(url);
    }

    public addFragment(url: string, ttl: number) {
        if (!this.fragmentAlreadyAdded(url) && !this.fragmentIsBlacklisted(url)) {
            let fragmentInfo = {
                "url": url,
                "refetchTime": new Date(new Date().getTime() + ttl) // now
            }
            this.queue.queue(fragmentInfo);
            this.queued.set(url, true);
        }
    }

    public nextFragmentExists() {
        return this.queued.length > 0;
    }

    public getNextFragmentToFetch() {
        let next = this.queue.dequeue();
        this.queued.del(next.url);
        return next;
    }
}


function compareFragments(a: any, b: any) {
    return a.refetchTime.getTime() - b.refetchTime.getTime();
};