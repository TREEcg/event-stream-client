import url from 'url';

export default class RateLimiter {
    public readonly nextRequest: Record<string, number>;
    public readonly minTime: number;

    public constructor(minTime: number) {
        this.nextRequest = {};
        this.minTime = minTime; // in milliseconds
    }

    public async planRequest(url: string) {
        const now = new Date().getTime();

        const domain = new URL(url).host;
        if (!this.nextRequest[domain]) {
            // First request to this domain, allow immediately
            this.nextRequest[domain] = now;
        }

        const difference = this.nextRequest[domain] - now;
        this.nextRequest[domain] = Math.max(now + this.minTime, this.nextRequest[domain] + this.minTime);
        if (difference > 0) {
            await this.sleep(difference);
        }
    }

    protected sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
