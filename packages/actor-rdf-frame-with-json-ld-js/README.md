# Comunica RDF Frame RDF Frame Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-frame-rdf-frame.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-frame-rdf-frame)

A comunica RDF Frame RDF Frame Actor.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-rdf-frame-rdf-frame
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-rdf-frame-rdf-frame/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": TODO,
      "@type": "ActorRdfFrameRdfFrame"
    }
  ]
}
```

### Config Parameters

TODO
