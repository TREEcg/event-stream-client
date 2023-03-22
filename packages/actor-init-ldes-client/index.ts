import { LDESClient } from './lib/LDESClient';

export * from "./lib/LDESClient";
export { EventStream, State } from "./lib/EventStream";

// tslint:disable:no-var-requires
//export default <LDESClient> require('./engine-default');

/**
 * Create a new LDES client engine from the default config.
 * @return {LDESClient}  engine.
 */
export function newEngine(): LDESClient {
    return require('./engine-default.js');
}
