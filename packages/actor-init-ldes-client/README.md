# @treecg/actor-init-ldes-client
Metadata harvester for a Linked Data Event Stream.

## Install

```
npm install -g @treecg/actor-init-ldes-client
```

In order to use it as a library, you can leave out the `-g`.

## How to use it


### Usage from the command line

```
actor-init-ldes-client --parameter ${PARAMETER} ${URL}
```

Possible parameters:

| Parameter  | Description | Possible values |
| ------------- | ------------- | ------------- |
|  pollingInterval | Number of milliseconds before refetching uncacheable fragments  | for example: 5000 |
| mimeType  | the MIME type of the output  | application/ld+json, text/turtle... |
| context  | path to a file with the JSON-LD context you want to use when MIME type is application/ld+json  | for example: ./context.jsonld |
| fromTime  | datetime to prune relations that have a lower datetime value | for example: 2020-01-01T00:00:00 |
| emitMemberOnce  | whether to emit a member only once, because collection contains immutable version objects.  | true / false |
| disablePolling  | whether to disable polling (by default: false).  | true / false |

Example commando with parameters:
```
actor-init-ldes-client --pollingInterval 5000 --mimeType application/ld+json --context context.jsonld --fromTime 2021-02-03T15:48:12.309Z --emitMemberOnce true --disablePolling true https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten
```


### Usage within application
The easiest way to create an engine (with default config) is as follows:
```
const newEngine = require('@treecg/actor-init-ldes-client').newEngine;

const LDESClient = new newEngine();
```

With the engine or client created, you can now use it to call te async ```createReadStream(url, options)``` method.
Here is an example synchronizing with a TREE root node of an Event Stream with polling interval of 5 seconds:

```javascript
import { newEngine } from '@treecg/actor-init-ldes-client';
 main()
 
 function main() {
     try {
         let url = "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";
         let options = {
             "pollingInterval": 5000, // millis
             "mimeType": "application/ld+json",
             "fromTime": new Date("2021-02-03T15:46:12.307Z"),
             "emitMemberOnce": true,
             "disablePolling": true,
             "jsonLdContext": {
                 "@context": [
                     "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/cultureel-erfgoed-object-ap.jsonld",
                     "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/persoon-basis.jsonld",
                     "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/cultureel-erfgoed-event-ap.jsonld",
                     {
                         "dcterms:isVersionOf": {
                             "@type": "@id"
                         },
                         "prov": "http://www.w3.org/ns/prov#"
                     }
                 ]
             }
         };
         let LDESClient = new newEngine();
         let eventstreamSync = LDESClient.createReadStream(url, options);
         eventstreamSync.on('data', (data) => {
             let obj = JSON.parse(data);
             console.log(obj);
         });
         eventstreamSync.on('end', () => {
             console.log("No more data!");
         });
     } catch (e) {
         console.error(e);
     }
 }
```
