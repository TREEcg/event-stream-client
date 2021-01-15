const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-init/Bus/Init'
});
const urn_comunica_myInit = new (require('./index.js').LDESClient)({
  'pollingInterval': 5000,
  'name': 'urn:comunica:myInit',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init
});
const urn_comunica_my = new (require('@comunica/runner').Runner)({
  'busInit': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init,
  'actors': [
    urn_comunica_myInit
  ]
});
module.exports = urn_comunica_my;

