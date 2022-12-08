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

URL can be a `tree:Node` from where relations will be followed OR the URI of a `tree:Collection`. For the latter, the
collection's URI will be dereferenced and one `tree:view` will be followed. 

Possible parameters are:

| Parameter  | Description                                                                                                                                                                                                                                                            | Possible values |
| ------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------- |
| pollingInterval | Number of milliseconds before refetching uncacheable fragments                                                                                                                                                                                                         | for example: 5000 |
| mimeType  | the MIME type of the output                                                                                                                                                                                                                                            | application/ld+json, text/turtle... |
| context  | path to a file with the JSON-LD context you want to use when MIME type is application/ld+json. **Pro-tip:** provide the full context without references to external context files, because there is no cache and thus they are requested each time a page gets loaded. | for example: ./context.jsonld |
| requestHeadersPath  | path to a file with the HTTP request headers you want to use                                                                                                                                                                                                           | for example: ./headers.json |
| fromTime  | datetime to prune relations that have a lower datetime value                                                                                                                                                                                                           | for example: 2020-01-01T00:00:00 |
| emitMemberOnce  | whether to emit a member only once, because collection contains immutable version objects.                                                                                                                                                                             | true / false |
| disableSynchronization  | whether to disable synchronization or not (by default set to "false", syncing is enabled)                                                                                                                                                                              | true / false |
| disableFraming  | whether to disable JSON-LD framing when mimeType is 'application/ld+json' or when representation is 'Object' (by default set to "false"). Value can be set to "true" or "false"                                                                                        | true / false |
| dereferenceMembers | whether to dereference members, because the collection pages do not contain all information (by default: false).                                                                                                                                                       | true / false |
| requestsPerMinute | how many requests per minutes may be sent to the same host (optional)                                                                                                                                                                                                  | any number |
| loggingLevel | The detail level of logging; useful for debugging problems. (default: info)                                                                                                                                                                                            | 'error', 'warn', 'info', 'verbose', 'debug', 'silly' |
| processedURIsCount | The maximum number of processed URIs (members and fragments) that remain in the cache. (default: 10000)                                                                                                                                                                | any number |

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

With the engine or client created, you can now use it to call the async ```createReadStream(url, options)``` or ```createReadStream(url, options, state)``` method.
Note that next to retrieving a serialized string (`mimeType` option) of member data, an `Object` (JSON-LD) or `Quads` representation is also possible with the Javascript API using the `representation` option. If you want to pause the streama and want to resume it later, you can export the state of the stream using the ```exportState()``` method once the stream is paused using ```pause()```.
 
Here is an example synchronizing with a TREE root node of an Event Stream with polling interval of 5 seconds:

```javascript
import { newEngine } from '@treecg/actor-init-ldes-client';
try {
    let url = "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";
    let options = {
        "pollingInterval": 5000, // millis
        "representation": "Object", //Object or Quads
        "requestHeaders": { // Optional request headers, useful when e.g. the endpoint requires Auth headers
            Accept: 'application/ld+json', 
        }
        "fromTime": new Date("2021-02-03T15:46:12.307Z"),
        "emitMemberOnce": true,
        "disableSynchronization": true,
        "disableFraming": true,
        "jsonLdContext": { //Only necessary for Object representation
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
    // OR if you have a previous state
    // let eventstreamSync = LDESClient.createReadStream(url, options, state);
    eventstreamSync.on('data', (member) => {
        if (options.representation) {
            if (options.representation === "Object") {
                const memberURI = member.id;
                console.log(memberURI);
                const object = member.object;
                console.log(object);
            } else if (options.representation === "Quads") {
                /* When using Quads representation, the members adhere to the [@Treecg/types Member interface](https://github.com/TREEcg/types/blob/main/lib/Member.ts) 
                    interface Member {
                        id: RDF.Term;
                        quads: Array<RDF.Quad>;
                    }
                */
                const memberURI = member.id.value;
                console.log(memberURI);
                const quads = member.quads;
                console.log(quads);
            }
        } else {
            console.log(member);
        }

        // Want to pause event stream?
        eventstreamSync.pause();
    });
    eventstreamSync.on('metadata', (metadata) => {
        if (metadata.treeMetadata) console.log(metadata.treeMetadata); // follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
        console.log(metadata.url); // page from where metadata has been extracted
    });
    eventstreamSync.on('pause', () => {
        // Export current state, but only when paused!
        let state = eventstreamSync.exportState();
    });
    eventstreamSync.on('end', () => {
        console.log("No more data!");
    });
} catch (e) {
    console.error(e);
}
```

## How resuming works
We save and load the EventStream state:
- during or after the run of the LDES Client, we pause it, and export its state.
- before a run of the LDES Client, we can load a previous state

**Pro-tip:** write/read the state from a JSON file, check out the [example code](https://github.com/TREEcg/LDES-Action/blob/main/src/utils/State.ts).

```typescript
interface State {
    bookkeeper: Bookkeeper;
    memberBuffer: Array<Member>;
    processedURIs: LRUCache;
}

interface Bookkeeper {
    queue: PriorityQueue;
    queued: LRUCache;
    blacklist: Set<string>;
}
```

- `queue` is a priorityQueue that stores all page ULRs that will be fetched, sorted on ascending refetch time. A page will not be re-added if the page-cache is set to immutable.
- `queued` is a least-recently-used Cache containings the last 500 URLS added to the `queue`, to prevent adding to many duplicates to the `queue`.
- `blacklist` is a Set containing blacklisted URLs that should not be added to the `queue`.
- `memberBuffer` is the internal Buffer containing the unread Members from the EventStream.
- `processedURIs` is a least-recently used Cache containing all processed URIs. When refetching pages, members having their URI in this set should not be emitted again when `"emitMemberOnce": true`.

### example
```typescript
import { newEngine } from '@treecg/actor-init-ldes-client';

// load previous state here (e.g. load from a json file on disk)
const previousState;

try {
    let url = "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";
    let options = {
        "representation": "Quads", //Object or Quads
        "emitMemberOnce": true,
        "disableSynchronization": false,
    };
    let LDESClient = new newEngine();
    
    if (previousState === undefined || previousState === null) {
        // if you don't have a previous state, the created EventStream will start from scratch
        let eventstreamSync = LDESClient.createReadStream(url, options);
    }
    else {
        // if you have a previous state, use it to create the EventStream
        let eventstreamSync = LDESClient.createReadStream(url, options, previousState);
    }
    
    // If the run takes longer than x minutes, pause the LDES Client
    cont timeoutms = 3600000; // amount of milliseconds before timeout
    const timeout = setTimeout(() => eventstreamSync.pause(), timeoutms);
    
    eventstreamSync.on('data', (member) => {
        console.log(member);
    });
    
    eventstreamSync.on('metadata', (metadata) => {
        if (metadata.treeMetadata)
            // follows the TREE metadata extractor structure (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
            console.log(metadata.treeMetadata);
        console.log(metadata.url); // page from where metadata has been extracted
    });
    
    eventstreamSync.on('now only syncing', () => {
        // All known pages have been fetched at least once when receiving this event.
        // This would be the point where we receive the `end` event in the `"disableSynchronization": true` equivalent
        timeout.unref();
        eventstreamSync.pause();
    });
    
    eventstreamSync.on('pause', () => {
        // Export current state, but only when paused!
        let state = eventstreamSync.exportState();
        // Save state here to reuse in a later run (e.g. save as a json file on disk)
    });
    
    eventstreamSync.on('end', () => {
        timeout.unref();
        console.log("No more data!");
    });
} catch (e) {
    console.error(e);
}
```
## Project Assumptions
This contains a list of things to look out for or possibly fix in the following improvements. 
* Not a really maintained project. Some library dependencies are deprecated and no longer supported.
* In a JSON-LD output, all the floating type values are represented in a scientific notation.
* Some public helper methods don't have an implementation.
* One can provide a context URL via the jsonLdContext configuration option, but in certain cases due the dependency on 
the `jsonld.context-parser.js` might throw an exception due to remote throttling of a certain context URL. Therefor 
it would be better that this part should be split in the application so that the application contains a cache of given 
context URL's with related context values. => This will solve issue that one notice when trying to resolve NGSI-LD 
related context files.