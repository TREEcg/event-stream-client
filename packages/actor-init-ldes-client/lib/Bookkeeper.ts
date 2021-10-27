const PriorityQueue = require('js-priority-queue');
const LRU = require("lru-cache");

export class Bookkeeper {
    protected readonly queue = new PriorityQueue({ comparator: compareFragments});
    protected readonly queued: any = new LRU({
        max: 500,
        maxAge: 1000 * 60 * 60 * 24
    }); // to know whether a fragment URL is already added to the priority queue
    protected blacklist: Set<string> = new Set();

    public constructor() {

    }

    public fragmentAlreadyAdded(url: string): boolean {
        return this.queued.has(url);
    }

    public fragmentIsBlacklisted(url: string): boolean {
        return this.blacklist.has(url);
    }

    public blacklistFragment(url: string): void {
        this.blacklist.add(url);
    }

    public addFragment(url: string, ttl: number): void {
        if (!this.fragmentAlreadyAdded(url) && !this.fragmentIsBlacklisted(url)) {
            let fragmentInfo: FragmentInfo = {
                "url": url,
                "refetchTime": new Date(new Date().getTime() + ttl) // now
            }
            this.queue.queue(fragmentInfo);
            this.queued.set(url, true);
        }
    }

    public nextFragmentExists(): boolean {
        return this.queued.length > 0;
    }

    public getNextFragmentToFetch(): FragmentInfo {
        let next = this.queue.dequeue();
        this.queued.del(next.url);
        return next;
    }

    public serialize(): Object {
        return {
            "queue": JSON.stringify(this.serializePriorityQueue()),
            "queued": JSON.stringify(this.queued.dump()),
            "blacklist": JSON.stringify([...this.blacklist])
        }
    }

    public deserialize(data: any): void {
        this.deserializePriorityQueue(JSON.parse(data.queue));
        this.queued.load(JSON.parse(data.queued));
        this.blacklist = new Set(JSON.parse(data.blacklist));
    }

    private serializePriorityQueue(): Array<any> {
        let serialized = [];
        while (this.queue.length > 0) {
            serialized.push(this.queue.dequeue());
        }
        return serialized;
    }

    private deserializePriorityQueue(serialized: Array<any>): void {
        this.queue.clear();
        serialized.forEach((element: FragmentInfo) => {
            this.queue.queue({
                "url": element.url,
                "refetchTime": new Date(element.refetchTime)
            });
        });
    }

    public inSyncingMode(): boolean {
        return this.queue.peek().refetchTime.getTime() > new Date().getTime();
    }
}

interface FragmentInfo {
    url: string;
    refetchTime: Date;
}

function compareFragments(a: any, b: any) {
    return a.refetchTime.getTime() - b.refetchTime.getTime();
};