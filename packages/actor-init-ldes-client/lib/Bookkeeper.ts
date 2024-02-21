// TODO: use a more modern priority queue
const PriorityQueue = require('js-priority-queue');
import LRU from 'lru-cache';

export class Bookkeeper {
    protected readonly queue = new PriorityQueue({ comparator: compareFragments});
    protected readonly queued: any = new LRU({
        max: 500,
        ttl: 1000 * 60 * 60 * 24
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
            const fragmentInfo: FragmentInfo = {
                "url": url,
                "refetchTime": new Date(new Date().getTime() + ttl) // now
            }
            this.queue.queue(fragmentInfo);
            this.queued.set(url, true);
        }
    }

    public nextFragmentExists(): boolean {
        return this.queued.size > 0;
    }

    public getNextFragmentToFetch(): FragmentInfo {
        let next = this.queue.dequeue();
        this.queued.delete(next.url);
        return next;
    }

    public serialize(): SerializedBookkeper {
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

export interface FragmentInfo {
    url: string;
    refetchTime: Date;
}

export interface SerializedBookkeper {
    queue: string;
    queued: string;
    blacklist: string;
}

function compareFragments(a: any, b: any) {
    return a.refetchTime.getTime() - b.refetchTime.getTime();
};
