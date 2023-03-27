import { Quad } from "@rdfjs/types";
import { AsyncIterator } from "asynciterator";
import rdfDereferencer from "rdf-dereference";
import RateLimiter from "./RateLimiter";
import { stream2Array } from "./Utils";

export default class MemberIterator extends AsyncIterator<Quad> {
    private waiting: boolean;
    private currentPage: Quad[]
    private currentIndex: number;

    private fetchedPages: Set<string>;
    private pageQueue: string[];

    private rateLimiter: RateLimiter;

    constructor(
        beginUrl: string,
        rateLimiter: RateLimiter,
        // TODO: shape
    ) {
        super();

        this.fetchedPages = new Set();
        this.fetchedPages.add(beginUrl);
        this.pageQueue = [];
        this.waiting = false;
        this.rateLimiter = rateLimiter;

        this.fetchPage(beginUrl);
    }

    public read(): Quad | null {
        if (this.closed) {
            return null;
        }

        if (this.waiting) {
            // waiting for the next page to be fetched
            this.readable = false;
            return null;
        }

        if (this.currentIndex >= this.currentPage.length) {
            // End of this page
            const pageUrl = this.pageQueue.pop();
            if (pageUrl) {
                // Fetch more data
                this.fetchPage(pageUrl);
            } else {
                this.close();
            }

            return null;
        }

        const item = this.currentPage[this.currentIndex];
        this.currentIndex += 1;

        return item;
    }

    protected async fetchPage(url: string) {
        if (!this.waiting) {
            // start fetching a page
            this.readable = false;
            this.waiting = true;
            this.currentPage = [];
            this.currentPage = await this.fetchPageRetry(url);
            this.followLinks(this.currentPage); // Extract more links to follow
            this.waiting = false;
            this.currentIndex = 0;
            this.readable = true;
        }
    }

    protected async fetchPageRetry(url: string, attempts = 3): Promise<Quad[]> {
        await this.rateLimiter.planRequest(url);

        try {
            const { data } = await rdfDereferencer.dereference(url);
            return await stream2Array<Quad>(data);
        } catch (error) {
            if (attempts > 0) {
                return this.fetchPageRetry(url, attempts - 1);
            } else {
                this.emit('error', `Cannot fetch ${url}`, error);
                this.close();
                return [];
            }
        }
    }

    /**
     * Decide which links to follow to complete the member
     * Currently follows hydra:next links
     * But should check the returned quads to a given shape definition
     * @param quads all new quads
     */
    protected followLinks(quads: Quad[]) {
        for (const quad of quads) {
            if (quad.predicate.value === "http://www.w3.org/ns/hydra/core#next") {
                const url = quad.object.value;
                if (!this.fetchedPages.has(url)) {
                    this.fetchedPages.add(url);
                    this.pageQueue.push(url);
                }
            }
        }

        return null;
    }
}
