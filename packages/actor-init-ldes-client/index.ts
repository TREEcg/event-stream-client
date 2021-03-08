import { LDESClient } from './lib/LDESClient';

export * from "./lib/LDESClient";
// tslint:disable:no-var-requires
//export default <LDESClient> require('./engine-default');

/**
 * Create a new comunica engine from the default config.
 * @return {ActorInitTypeaheadBrowser} A comunica engine.
 */
export function newEngine(): LDESClient {
    return require('./engine-default.js');
}