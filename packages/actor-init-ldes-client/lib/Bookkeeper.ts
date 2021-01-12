const PriorityQueue = require('js-priority-queue');

export class Bookkeeper {
    protected readonly queue = new PriorityQueue({ comparator: compareFragments});
    protected readonly queued: any = {}; // to know whether a fragment URL is already added to the priority queue

    public constructor() {

    }

    public addFragment(url: string, ttl: number) {
        if (!Object.keys(this.queued).includes(url)) {
            let fragmentInfo = {
                "url": url,
                "refetchTime": new Date(new Date().getTime() + ttl) // now
            }
            this.queue.queue(fragmentInfo);
            this.queued[url] = {};
        }
    }

    public nextFragmentExists() {
        return this.queue.length > 0 ? true : false;
    }

    public getNextFragmentToFetch() {
        let next = this.queue.dequeue();
        delete this.queued[next.url];
        return next;
    }
}


function compareFragments(a: any, b: any) {
    return a.refetchTime.getTime() - b.refetchTime.getTime();
};