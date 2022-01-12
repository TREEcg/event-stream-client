const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-init/Bus/Init'
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_metadata_extract_Bus_RdfMetadataExtract = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-rdf-metadata-extract/Bus/RdfMetadataExtract'
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-rdf-parse/Bus/RdfParse'
});
const https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_filter_object_Bus_RdfFilterObject = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@treecg/bus-rdf-filter-object/Bus/RdfFilterObject'
});
const https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_frame_Bus_RdfFrame = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@treecg/bus-rdf-frame/Bus/RdfFrame'
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_serialize_Bus_RdfSerialize = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-rdf-serialize/Bus/RdfSerialize'
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_http_Bus_Http = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-http/Bus/Http'
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_html_Bus_RdfParseHtml = new (require('@comunica/core').Bus)({
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/bus-rdf-parse-html/Bus/RdfParseHtml'
});
const urn_comunica_mediatorRdfMetadataExtractTree = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfMetadataExtractTree',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_metadata_extract_Bus_RdfMetadataExtract
});
const urn_comunica_actorRdfMetadataExtractTree = new (require('@treecg/actor-rdf-metadata-extract-tree').ActorRdfMetadataExtractTree)({
  'name': 'urn:comunica:actorRdfMetadataExtractTree',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_metadata_extract_Bus_RdfMetadataExtract
});
const urn_comunica_mediatorRdfParse = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfParse',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_myRdfParserN3 = new (require('@comunica/actor-rdf-parse-n3').ActorRdfParseN3)({
  'mediaTypes': {
  'application/n-quads': '1.0',
  'application/trig': '0.95',
  'application/n-triples': '0.8',
  'text/turtle': '0.6',
  'text/n3': '0.35'
},
  'mediaTypeFormats': {
  'application/n-quads': 'http://www.w3.org/ns/formats/N-Quads',
  'application/trig': 'http://www.w3.org/ns/formats/TriG',
  'application/n-triples': 'http://www.w3.org/ns/formats/N-Triples',
  'text/turtle': 'http://www.w3.org/ns/formats/Turtle',
  'text/n3': 'http://www.w3.org/ns/formats/N3'
},
  'priorityScale': '1',
  'name': 'urn:comunica:myRdfParserN3',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_myRdfParserRdfXml = new (require('@comunica/actor-rdf-parse-rdfxml').ActorRdfParseRdfXml)({
  'mediaTypes': {
  'application/rdf+xml': '1.0'
},
  'mediaTypeFormats': {
  'application/rdf+xml': 'http://www.w3.org/ns/formats/RDF_XML'
},
  'priorityScale': '5.0E-1',
  'name': 'urn:comunica:myRdfParserRdfXml',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_myRdfParserXmlRdfa = new (require('@comunica/actor-rdf-parse-xml-rdfa').ActorRdfParseXmlRdfa)({
  'mediaTypes': {
  'application/xml': '1.0',
  'text/xml': '1.0',
  'image/svg+xml': '1.0'
},
  'mediaTypeFormats': {
  'application/xml': 'http://www.w3.org/ns/formats/RDFa',
  'text/xml': 'http://www.w3.org/ns/formats/RDFa',
  'image/svg+xml': 'http://www.w3.org/ns/formats/RDFa'
},
  'priorityScale': '3.0E-1',
  'name': 'urn:comunica:myRdfParserXmlRdfa',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_mediatorRdfFilterObject = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfFilterObject',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_filter_object_Bus_RdfFilterObject
});
const urn_comunica_myRdfFilterObjectsWithQuadstore = new (require('@treecg/actor-rdf-filter-objects-with-quadstore').ActorRdfFilterObjectsWithQuadstore)({
  'name': 'urn:comunica:myRdfFilterObjectsWithQuadstore',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_filter_object_Bus_RdfFilterObject
});
const urn_comunica_mediatorRdfFrame = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfFrame',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_frame_Bus_RdfFrame
});
const urn_comunica_mediatorRdfSerialize = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfSerialize',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_serialize_Bus_RdfSerialize
});
const urn_comunica_mediatorRdfSerialize2 = new (require('@comunica/mediator-race').MediatorRace)({
  'name': 'urn:comunica:mediatorRdfSerialize2',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_serialize_Bus_RdfSerialize
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_actor_init_sparql__1_0_0_config_sets_rdf_serializers_json_myRdfSerializerN3 = new (require('@comunica/actor-rdf-serialize-n3').ActorRdfSerializeN3)({
  'mediaTypes': {
  'application/trig': '1.0',
  'application/n-quads': '0.7',
  'text/turtle': '0.6',
  'application/n-triples': '0.3',
  'text/n3': '0.2'
},
  'mediaTypeFormats': {
  'application/trig': 'http://www.w3.org/ns/formats/TriG',
  'application/n-quads': 'http://www.w3.org/ns/formats/N-Quads',
  'text/turtle': 'http://www.w3.org/ns/formats/Turtle',
  'application/n-triples': 'http://www.w3.org/ns/formats/N-Triples',
  'text/n3': 'http://www.w3.org/ns/formats/N3'
},
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/^1.0.0/config/sets/rdf-serializers.json#myRdfSerializerN3',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_serialize_Bus_RdfSerialize
});
const https___linkedsoftwaredependencies_org_bundles_npm__comunica_actor_init_sparql__1_0_0_config_sets_rdf_serializers_json_myRdfSerializeJsonLd = new (require('@comunica/actor-rdf-serialize-jsonld').ActorRdfSerializeJsonLd)({
  'jsonStringifyIndentSpaces': 2,
  'mediaTypes': {
  'application/ld+json': '1.0'
},
  'mediaTypeFormats': {
  'application/ld+json': 'http://www.w3.org/ns/formats/JSON-LD'
},
  'priorityScale': '9.0E-1',
  'name': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-init-sparql/^1.0.0/config/sets/rdf-serializers.json#myRdfSerializeJsonLd',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_serialize_Bus_RdfSerialize
});
const urn_comunica_myHttpFetcher = new (require('@comunica/actor-http-native').ActorHttpNative)({
  'agentOptions': '{ "keepAlive": true, "maxSockets": 5 }',
  'name': 'urn:comunica:myHttpFetcher',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_http_Bus_Http
});
const urn_comunica_mediatorHttp = new (require('@comunica/mediator-number').MediatorNumber)({
  'field': 'time',
  'type': 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/mediator-number/Mediator/Number/type/TypeMin',
  'ignoreErrors': true,
  'name': 'urn:comunica:mediatorHttp',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_http_Bus_Http
});
const urn_comunica_myRdfParserHtml = new (require('@comunica/actor-rdf-parse-html').ActorRdfParseHtml)({
  'busRdfParseHtml': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_html_Bus_RdfParseHtml,
  'mediaTypes': {
  'text/html': '1.0',
  'application/xhtml+xml': '0.9'
},
  'mediaTypeFormats': {
  'text/html': 'http://www.w3.org/ns/formats/HTML',
  'application/xhtml+xml': 'http://www.w3.org/ns/formats/HTML'
},
  'priorityScale': '2.0E-1',
  'name': 'urn:comunica:myRdfParserHtml',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_myRdfParserHtmlMicrodata = new (require('@comunica/actor-rdf-parse-html-microdata').ActorRdfParseHtmlMicrodata)({
  'name': 'urn:comunica:myRdfParserHtmlMicrodata',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_html_Bus_RdfParseHtml
});
const urn_comunica_myRdfParserHtmlRdfa = new (require('@comunica/actor-rdf-parse-html-rdfa').ActorRdfParseHtmlRdfa)({
  'name': 'urn:comunica:myRdfParserHtmlRdfa',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_html_Bus_RdfParseHtml
});
const urn_comunica_myLDESClient = new (require('./index.js').LDESClient)({
  'pollingInterval': 5000,
  'mimeType': 'application/ld+json',
  'jsonLdContextString': '{"@context":  {}}',
  'jsonLdContextPath': '',
  'disablePolling': false,
  'disableSynchronization': false,
  'emitMemberOnce': true,
  'dereferenceMembers': false,
  'mediatorRdfMetadataExtractTree': urn_comunica_mediatorRdfMetadataExtractTree,
  'mediatorRdfParse': urn_comunica_mediatorRdfParse,
  'mediatorRdfFilterObject': urn_comunica_mediatorRdfFilterObject,
  'mediatorRdfFrame': urn_comunica_mediatorRdfFrame,
  'mediatorRdfSerialize': urn_comunica_mediatorRdfSerialize,
  'loggingLevel': 'info',
  'name': 'urn:comunica:myLDESClient',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init
});
const urn_comunica_myActorRdfFrameWithJSONLDjs = new (require('@treecg/actor-rdf-frame-with-json-ld-js').ActorRdfFrameWithJSONLDjs)({
  'mediatorRdfSerialize': urn_comunica_mediatorRdfSerialize2,
  'name': 'urn:comunica:myActorRdfFrameWithJSONLDjs',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__treecg_bus_rdf_frame_Bus_RdfFrame
});
const urn_comunica_myRdfParserJsonLd = new (require('@comunica/actor-rdf-parse-jsonld').ActorRdfParseJsonLd)({
  'mediatorHttp': urn_comunica_mediatorHttp,
  'mediaTypes': {
  'application/ld+json': '1.0',
  'application/json': '0.5'
},
  'mediaTypeFormats': {
  'application/ld+json': 'http://www.w3.org/ns/formats/JSON-LD',
  'application/json': 'http://www.w3.org/ns/formats/JSON-LD'
},
  'priorityScale': '9.0E-1',
  'name': 'urn:comunica:myRdfParserJsonLd',
  'bus': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_rdf_parse_Bus_RdfParse
});
const urn_comunica_my = ({
  'busInit': https___linkedsoftwaredependencies_org_bundles_npm__comunica_bus_init_Bus_Init,
  'actors': [
  urn_comunica_myLDESClient,
  urn_comunica_actorRdfMetadataExtractTree,
  urn_comunica_myHttpFetcher,
  urn_comunica_myRdfParserN3,
  urn_comunica_myRdfParserJsonLd,
  urn_comunica_myRdfParserRdfXml,
  urn_comunica_myRdfParserXmlRdfa,
  urn_comunica_myRdfParserHtml,
  urn_comunica_myRdfParserHtmlMicrodata,
  urn_comunica_myRdfParserHtmlRdfa,
  urn_comunica_myRdfFilterObjectsWithQuadstore,
  urn_comunica_myActorRdfFrameWithJSONLDjs,
  https___linkedsoftwaredependencies_org_bundles_npm__comunica_actor_init_sparql__1_0_0_config_sets_rdf_serializers_json_myRdfSerializerN3,
  https___linkedsoftwaredependencies_org_bundles_npm__comunica_actor_init_sparql__1_0_0_config_sets_rdf_serializers_json_myRdfSerializeJsonLd
]
});
module.exports = urn_comunica_myLDESClient;

