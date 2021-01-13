# @brechtvdv/actor-init-ldes-client
Fetches fragments of a TREE Event Stream and emits its data (in the future: members) when a fragment's caching headers has been invalidated
In order to avoid receiving duplicate members, we will create in the future a tool filters members by storing it. 

## Install

```
npm install -g @brechtvdv/actor-init-ldes-client
```

In order to use it as a library, you can leave out the `-g`.

## How to use it


### Usage from the command line

```
actor-init-ldes-client --pollingInterval 10000 https://lodi.ilabt.imec.be/coghent/industriemuseum/objecten
```

### Usage within application
The easyest way to create an engine (with default config) is as follows:
```
const newEngine = require('@brechtvdv/actor-init-ldes-client').default;

const LDESClient =  newEngine();
```

With the engine or client created, you can now use it to call te async ```createReadStream(url, options)``` method.
Here is an example synchronizing with a TREE root node of an Event Stream with polling interval of 5 seconds:

```javascript
  try {
    let url = "https://lodi.ilabt.imec.be/coghent/industriemuseum/objecten";
    let options = {
      "pollingInterval": 5000 // millis
    };
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on('data', (data) => {
      console.log(data)
    });
    eventstreamSync.on('end', () => {
      console.log("No more data!")
    });
  } catch (e) {
    console.error(e);
  }
```