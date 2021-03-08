# Comunica RDF Filter Object With Framing

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-filter-object-rdf-filter-object-with-framing.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-filter-object-rdf-filter-object-with-framing)

An RDF Filter actor that extracts triples related to a specific object using JSON-LD framing on object identifier.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-rdf-filter-object-with-framing
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@treecg/actor-rdf-filter-object-with-framing/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": TODO,
      "@type": "ActorRdfFilterObjectWithFraming"
    }
  ]
}
```

### Config Parameters

TODO
