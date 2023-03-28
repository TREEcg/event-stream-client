# Change Log

<a name="v4.0.0"></a>
## [v4.0.0](https://github.com/TREEcg/event-stream-client/compare/v3.0.2...v4.0.0) - 2023-03-28

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge pull request #66 from TREEcg/fix/update-dependencies](https://github.com/TREEcg/event-stream-client/commit/e65ea920e74ac24e281ae1aff5f321b542f13629)
* [Remove coverage threshold (for now)](https://github.com/TREEcg/event-stream-client/commit/34234fe9e2323374381e7366c5708158b864ec71)
* [Fix component.js build process](https://github.com/TREEcg/event-stream-client/commit/6e679ca7df3a45c3ffa904ff9385c40278f11ebe)
* [Go back to npm ci + fully remove yarn commands](https://github.com/TREEcg/event-stream-client/commit/df6e6e6715de803884e1318e570ee2c09e866d29)
* [Try normal npm i](https://github.com/TREEcg/event-stream-client/commit/f77f78037a1ecba31472a8879b628dcf4ac4beba)
* [Commit package-lock.json](https://github.com/TREEcg/event-stream-client/commit/e7077881acfc4a93cbe55925d9ad051d7f8e7030)
* [Add github action for CI](https://github.com/TREEcg/event-stream-client/commit/acd58da4c5273ce28654dedb049c82190d26ffa3)
* [Changes include: - Fix time-based prunning of members - Extract ldes:timestampPath from LDES metadata - Handle edge case where no members are emitted on sync mode](https://github.com/TREEcg/event-stream-client/commit/855010eec1d365608d70124e88cf45051719dfc7)
* [Changes include: - Remove unmaintained and stale dependencies - Use WebStreams to process fetched pages - Use RDFJS store to do BGP lookups - Clean up code](https://github.com/TREEcg/event-stream-client/commit/3c07df3e7e4d9bab6f90826b81eab9381655ec44)
* [Remove in-memory caching of all page requests](https://github.com/TREEcg/event-stream-client/commit/453635482b4e5b94009d058838dc3c921b4048f8)
* [Fix cli error message](https://github.com/TREEcg/event-stream-client/commit/54c20fd5a062f79beae90192de380d47ab49e353)
* [Changes include: - Define enum type for output representation - Rename sychronization event - Make sure Event Stream tests run properly](https://github.com/TREEcg/event-stream-client/commit/a79270d5ec8374772f3a64ff642c275de7ec3e8b)
* [Fix LDES client unit tests + properly close stream](https://github.com/TREEcg/event-stream-client/commit/1ffd6b928c3a11a773f5c53ad7a615bc85b11cea)
* [Fix library unit tests + issue on stream pause/flow modes](https://github.com/TREEcg/event-stream-client/commit/c33a7097fa52ada8d514f66e26457b8dcd4142e3)
* [Fix bookkeeper unit tests](https://github.com/TREEcg/event-stream-client/commit/218501fbbefe9b1145d24bf969f7ae386bde3039)
* [Clean up dependencies](https://github.com/TREEcg/event-stream-client/commit/5bc95cb126c13a3cb32394db71875321aada22eb)
* [Update dependencies](https://github.com/TREEcg/event-stream-client/commit/0dd2114766b594cdf51781145dd5d6a8fa70577d)
* [Fix unit tests of RDF object filter with a quadstore](https://github.com/TREEcg/event-stream-client/commit/2b751ddb41bc758eb7d3d1554a768c4156374d13)
* [Fix unit tests of rdf filtering with json-ld framing actor](https://github.com/TREEcg/event-stream-client/commit/fb2e98b983737cf9bf0020ef4785a8e93bdcd16b)
* [Clean up and update more dependencies](https://github.com/TREEcg/event-stream-client/commit/60f3c20a42f2de7a2ca0679c31b83b65fbfca56f)
* [Update jest and jsonld dependencies](https://github.com/TREEcg/event-stream-client/commit/e44a6367081acccfcf1600947c0a9caf6d851610)
* [Update lerna and work with npm](https://github.com/TREEcg/event-stream-client/commit/9ce2a8e0c546a481964f0851c1e3f626ba9efd2f)
* [Update typescript dependencies](https://github.com/TREEcg/event-stream-client/commit/26cfa56f61d691a6348120bd07c91d3c38f132b9)

<a name="v3.0.2"></a>
## [v3.0.2](https://github.com/TREEcg/event-stream-client/compare/v3.0.1...v3.0.2) - 2023-03-03

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix logic to allow for readable stream paused mode](https://github.com/TREEcg/event-stream-client/commit/211c03666c937924b3ad02eec2ec87c48d0b825b)
* [Merge pull request #62 from redpencilio/fix/pause_on_sync_when_necessary](https://github.com/TREEcg/event-stream-client/commit/1ee3dcef3ec65160d587231ac28dfcad961f703c)
* [Merge pull request #63 from TREEcg/demonstrator-assumptions](https://github.com/TREEcg/event-stream-client/commit/78f47909cb5d6e7a0f6739ad01287950ca825f08)
* [Small corrections in the assumption section](https://github.com/TREEcg/event-stream-client/commit/f200d809fe7911a9d0fd2837eab793191c87e6e1)
* [Add assumption section to the README.md based on the findings of this project as a dependency for the IOW Demonstrater.](https://github.com/TREEcg/event-stream-client/commit/62f6d43bc9f15e097e7ee87ae6615d4714020031)
* [Merge branch 'TREEcg:main' into fix/pause_on_sync_when_necessary](https://github.com/TREEcg/event-stream-client/commit/229e030741ce019d3f696eea01f561b4de1e498f)
* [Add pro-tip json-ld context](https://github.com/TREEcg/event-stream-client/commit/a4308535bc1ad07f45f71c1c91268303851f09c7)
* [Add pro-tip for writing/reading state](https://github.com/TREEcg/event-stream-client/commit/e024559c407ac36983b99173e7a80620cb922102)
* [ensure stream is paused on sync if necessary](https://github.com/TREEcg/event-stream-client/commit/2689c50527420d5fa4d1f18a57ccfb38a949aac1)
* [update README](https://github.com/TREEcg/event-stream-client/commit/d723ade34a321194c7223807f6609ce166b0cdf3)
* [add support for passing custom headers when creating an eventStream](https://github.com/TREEcg/event-stream-client/commit/865f1272f58a9d4756c7f03603d4ea4fa738e38b)

<a name="v3.0.1"></a>
## [v3.0.1](https://github.com/TREEcg/event-stream-client/compare/v3.0.0...v3.0.1) - 2022-10-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Add option requestHeaders also to CLI](https://github.com/TREEcg/event-stream-client/commit/3a851ce1f6dc13d3475389725e2046bd129775b1)
* [update README](https://github.com/TREEcg/event-stream-client/commit/5eda2bec76a8d852011a112bdd2bade8167f1a39)
* [add support for passing custom headers when creating an eventStream](https://github.com/TREEcg/event-stream-client/commit/546b6977e5d5d2ceb4087e6c684068a78829fbf3)
* [Update LICENSE](https://github.com/TREEcg/event-stream-client/commit/14de7d465e970bd8ea9c2ad962c76e917fc7230b)
* [Update LICENSE](https://github.com/TREEcg/event-stream-client/commit/4c3b37e21b45186967c481a9ab39dbe159b8fe71)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/TREEcg/event-stream-client/compare/v2.6.0...v3.0.0) - 2022-08-25

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge pull request #60 from TREEcg/feat/update-componentsjs](https://github.com/TREEcg/event-stream-client/commit/543f70406e896ad1184fb03eb3e8e7e9519dad2f)
* [Update LDES Client to Comunica 2.3](https://github.com/TREEcg/event-stream-client/commit/4a2df0449a9810817e6a732ce17b47302d3758ef)
* [Merge branch 'development' of github.com:TREEcg/event-stream-client into development](https://github.com/TREEcg/event-stream-client/commit/21d4db5a61af7e81a2dfd3e376b9776f5e5cea41)
* [Merge pull request #31 from TREEcg/fix-12](https://github.com/TREEcg/event-stream-client/commit/dc9fa2dd93f2db08c15e77e782fedbdc4bd50f4b)
* [Merge branch 'development' into fix-12](https://github.com/TREEcg/event-stream-client/commit/4013d9a53519d5dd865cb0d28d042dc50b3634f9)
* [Make JSON-LD framing optional](https://github.com/TREEcg/event-stream-client/commit/735dbeefd96e01b816c31f2fd86d7f86cd9fad10)

<a name="v2.6.0"></a>
## [v2.6.0](https://github.com/TREEcg/event-stream-client/compare/v2.5.11...v2.6.0) - 2022-06-13

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge branch 'main' of github.com:TREEcg/event-stream-client into main](https://github.com/TREEcg/event-stream-client/commit/095ace9736d8a4fb04b70f0ca5d7105ec69fd2c4)
* [Change type of JsonLdContext to JsonLdDocument](https://github.com/TREEcg/event-stream-client/commit/6c7019f702b13d2db13076d81dbd3c8540d16170)
* [Use LRU cache for processedURIs](https://github.com/TREEcg/event-stream-client/commit/ea74182fd52456f663464c11676643b5e7390ba6)
* [Bump to release version v2.5.11](https://github.com/TREEcg/event-stream-client/commit/448d1555b1108b291f67ea80a39bdf95c7015a19)
* [Check with and without www when searching for view](https://github.com/TREEcg/event-stream-client/commit/19fe324190059b88d9043ea8ee894db64982ef7a)
* [Feat 36 - Pause and Resume EventStream with exportState/importState methods (#42)](https://github.com/TREEcg/event-stream-client/commit/0b071519f5acde44c716afbb6700b31ab49a0f0e)
* [Make JSON-LD framing optional](https://github.com/TREEcg/event-stream-client/commit/8eee74fccdfd4caa354ff2d9800f0874171e3db1)
* [Merge branch 'main' into feat/logger](https://github.com/TREEcg/event-stream-client/commit/5b6c23e65c1a625e8b764dbeae6ef5790cea7aa5)
* [feat: Remove local Logger and import logger from @treecg/types](https://github.com/TREEcg/event-stream-client/commit/574432a0f691b8247828eeae81382257141df30f)
* [feat: Add component.js config for logging + fix error logging](https://github.com/TREEcg/event-stream-client/commit/e0ff2eee3c9e6d84d7560c5608c077d528ed264a)
* [feat: Add logging functionality](https://github.com/TREEcg/event-stream-client/commit/45680dd323ebd526a8fb02ed84e72f7363d92ef4)

<a name="v2.5.11"></a>
## [v2.5.11](https://github.com/TREEcg/event-stream-client/compare/v2.5.9...v2.5.11) - 2022-05-23

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Check with and without www when searching for view](https://github.com/TREEcg/event-stream-client/commit/604e0cda99e877c6cef2c093c6762c1e396df8ff)

<a name="v2.5.7"></a>
## [v2.5.7](https://github.com/TREEcg/event-stream-client/compare/v2.5.6...v2.5.7) - 2021-11-05

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.


<a name="v2.5.6"></a>
## [v2.5.6](https://github.com/TREEcg/event-stream-client/compare/v2.5.6-alpha.0...v2.5.6) - 2021-11-05

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.


All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.5.6](https://github.com/TREEcg/event-stream-client/compare/v2.5.6-alpha.0...v2.5.6) (2021-11-05)

**Note:** Version bump only for package @treecg/event-stream-client





# Changelog
All notable changes to this project will be documented in this file.

<a name="v2.5.6-alpha.0"></a>
## [v2.5.6-alpha.0](https://github.com/TREEcg/event-stream-client/compare/v2.5.5...v2.5.6-alpha.0) - 2021-11-04

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [fix: don't start a new fetch immediately after emitting 'now only syncing' event (#52)](https://github.com/TREEcg/event-stream-client/commit/39d413ff6a19984bd0049bb2179cf6d68bc4bb53)

<a name="v2.5.5"></a>
## [v2.5.5](https://github.com/TREEcg/event-stream-client/compare/v2.5.4...v2.5.5) - 2021-10-28

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Feat 46 - event "only syncing now" should only be emitted when disbableSynchronization is false (#49)](https://github.com/TREEcg/event-stream-client/commit/4720c04f9e4fec3bf467a69ec622f5d6ef1519f3)
* [feat: emit event when in syncing mode (#47)](https://github.com/TREEcg/event-stream-client/commit/3f16f41e871a499ef8e4bf7148f75e2591024737)

<a name="v2.5.4"></a>
## [v2.5.4](https://github.com/TREEcg/event-stream-client/compare/v2.5.3...v2.5.4) - 2021-10-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [feat: export interface State from EventStream](https://github.com/TREEcg/event-stream-client/commit/88106565ee1f68baf24e1a3d537c578dd9e36a84)

<a name="v2.5.3"></a>
## [v2.5.3](https://github.com/TREEcg/event-stream-client/compare/v2.5.2...v2.5.3) - 2021-10-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix 43 - Enable exportState after end event (#44)](https://github.com/TREEcg/event-stream-client/commit/80fb624a809ff52cb061534fa80e5b2c23fdbdcf)

<a name="v2.5.2"></a>
## [v2.5.2](https://github.com/TREEcg/event-stream-client/compare/v2.5.1...v2.5.2) - 2021-10-26

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [feat: add EventStream export inside index.ts](https://github.com/TREEcg/event-stream-client/commit/92b112e50c18a7b5764906c4776453cea5fdb0a7)

<a name="v2.5.1"></a>
## [v2.5.1](https://github.com/TREEcg/event-stream-client/compare/v2.4.0...v2.5.1) - 2021-10-26

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Bump to release version v2.5.0](https://github.com/TREEcg/event-stream-client/commit/53aca9513254be2d4d48d8041f36c1c43e08b243)
* [Feat 36 - Pause and Resume EventStream with exportState/importState methods (#42)](https://github.com/TREEcg/event-stream-client/commit/18c06cea21f106657e784c55ef3b89d50fcf858a)
* [Add serialisation & deserialization for Bookkeeper data structures  (#35)](https://github.com/TREEcg/event-stream-client/commit/67a8fee9a48241da6dd5133027a8ac41a7c52984)
* [Bump to release version v2.4.1](https://github.com/TREEcg/event-stream-client/commit/d8c9154f14bc842f0fe04b653a01abdd8f421819)
* [Fix 40 - remove custom memberBuffer and use internal readableBuffer (#41)](https://github.com/TREEcg/event-stream-client/commit/ddd8ae59cdf5a23bb5adb3a90f3ec42fa849dd36)

<a name="v2.5.0"></a>
## [v2.5.0](https://github.com/TREEcg/event-stream-client/compare/v2.4.0...v2.5.0) - 2021-10-26

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Feat 36 - Pause and Resume EventStream with exportState/importState methods (#42)](https://github.com/TREEcg/event-stream-client/commit/18c06cea21f106657e784c55ef3b89d50fcf858a)
* [Add serialisation & deserialization for Bookkeeper data structures  (#35)](https://github.com/TREEcg/event-stream-client/commit/67a8fee9a48241da6dd5133027a8ac41a7c52984)
* [Bump to release version v2.4.1](https://github.com/TREEcg/event-stream-client/commit/d8c9154f14bc842f0fe04b653a01abdd8f421819)
* [Fix 40 - remove custom memberBuffer and use internal readableBuffer (#41)](https://github.com/TREEcg/event-stream-client/commit/ddd8ae59cdf5a23bb5adb3a90f3ec42fa849dd36)

<a name="v2.4.0"></a>
## [v2.4.0](https://github.com/TREEcg/event-stream-client/compare/v2.3.11...v2.4.0) - 2021-10-26

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge pull request #39 from TREEcg/feat-32](https://github.com/TREEcg/event-stream-client/commit/440aa507eae719cf86e28bef8ec82cf6ce1da230)
* [feat: update readme](https://github.com/TREEcg/event-stream-client/commit/946443fee3c3f5703596a8eba4efcdf7793da893)
* [Merge pull request #38 from TREEcg/fix-37](https://github.com/TREEcg/event-stream-client/commit/8a38e64a2736e713aec81b5d4e355d2a14e063ac)
* [fix: change Quads events to adhere to Member interface](https://github.com/TREEcg/event-stream-client/commit/a4a5b4cdb06ffa46d9774d7a99c44f8e552cd8ce)
* [feat: add dependency @treecg/types](https://github.com/TREEcg/event-stream-client/commit/ad273370c04b859b9ee3b19f57674b00aeb2e90b)
* [fix: rename bookie to bookkeeper](https://github.com/TREEcg/event-stream-client/commit/89fcf900a8977bab47fd7511f5253862c221bd5c)

<a name="v2.3.11"></a>
## [v2.3.11](https://github.com/TREEcg/event-stream-client/compare/v2.3.10...v2.3.11) - 2021-09-22

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge branch 'development' into main](https://github.com/TREEcg/event-stream-client/commit/1d48a79314b4fd1f2b7f11f5b5489751fd996c58)
* [Add disableSynchronization in README](https://github.com/TREEcg/event-stream-client/commit/4d0456f306052dd3ad88f8b447f1872d700f1c73)
* [Merge branch 'development' into main](https://github.com/TREEcg/event-stream-client/commit/68d8947ba7d37e4bf5c7d5af07a47f052bd4ef7c)
* [Merge branch 'fix-28' into development](https://github.com/TREEcg/event-stream-client/commit/7b3349218a0186b8fe7397a98db1645032abccd5)
* [Update README with tree metadata](https://github.com/TREEcg/event-stream-client/commit/aa6f7598a7dfa1a64623e07485479f28629c9f03)
* [Link to tree extractor and use treeMetadata.metadata](https://github.com/TREEcg/event-stream-client/commit/41f61b0f9df8c0ea1c63a182a8379ca523eb2a92)
* [Throw error instead of using expect](https://github.com/TREEcg/event-stream-client/commit/1f41ee4c4d1072d6f809c3b535fc24d6a3343094)
* [Rename disablePolling with disableSynchronization](https://github.com/TREEcg/event-stream-client/commit/31373ba83a586f3a9ec67192e86bac99804f39ec)
* [Document and test how the collection's metadata is exposed](https://github.com/TREEcg/event-stream-client/commit/f60d44db968799c0a00dd01f517a6edc25a13551)

<a name="v2.3.10"></a>
## [v2.3.10](https://github.com/TREEcg/event-stream-client/compare/v2.3.9...v2.3.10) - 2021-09-16

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge branch 'feat/pickfirstview' into development](https://github.com/TREEcg/event-stream-client/commit/b70c448b71c7f8744e026a1482f95c6b302a46d8)
* [Merge branch 'fix-tests' into development](https://github.com/TREEcg/event-stream-client/commit/f6c6a34d852573680fb93cdf24510be9f08bca9d)
* [Clean up tests](https://github.com/TREEcg/event-stream-client/commit/001d45022783b499d12a6c9549101444df578c68)
* [Merge branch 'development' into fix-tests](https://github.com/TREEcg/event-stream-client/commit/6a508d4bed01aea429bf49979ce6957f31d49622)
* [Just made LDESClient tests run](https://github.com/TREEcg/event-stream-client/commit/bf35d9b6fe8c606623fa03ecd98fff32ca0cf973)
* [Merge branch 'development' into fix-tests](https://github.com/TREEcg/event-stream-client/commit/3b22fba8efbe42362bcbe13b61295e6218c2ea29)
* [First try at cleaning up the tests](https://github.com/TREEcg/event-stream-client/commit/08578a018de2799a0b89236b9d552becf0122434)
* [Document in readme](https://github.com/TREEcg/event-stream-client/commit/3ea9bb21e09989b91421e89f308df9e2b2c5d8f8)
* [Fix: URL to tree:collection, pick first view encountered when no relations are found](https://github.com/TREEcg/event-stream-client/commit/bd920102db440f1b313d9f6edccfea45220a9498)

<a name="v2.3.9"></a>
## [v2.3.9](https://github.com/TREEcg/event-stream-client/compare/v2.3.8...v2.3.9) - 2021-09-16

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Use done to prevent extra buffering](https://github.com/TREEcg/event-stream-client/commit/510c5b556c9897c4b577ffe8c9eedc48fa2a4653)
* [Unused variable](https://github.com/TREEcg/event-stream-client/commit/a5e19194b089100247257838be2c9a8b0cd2612a)
* [Don’t wait until the buffer is full to already continue writing data](https://github.com/TREEcg/event-stream-client/commit/29b5776bb0b194fc46bb8289522db85c1b18f225)
* [Removed useless import](https://github.com/TREEcg/event-stream-client/commit/00508dd6bd70ec7111e5b7afcf1a86b0a54c85ac)
* [Also continues buffering when empty pages are being processed](https://github.com/TREEcg/event-stream-client/commit/b6203a0e519b2bf832f64c824d743858678b354a)
* [Remove faulty and duplicate test-case](https://github.com/TREEcg/event-stream-client/commit/e462631c12c3b1e0f26b66fdc5d907268a5191c9)
* [merged](https://github.com/TREEcg/event-stream-client/commit/1cad62662734d20d3035b953c42804cc9e6418d6)
* [Merge branch 'main' into development](https://github.com/TREEcg/event-stream-client/commit/6928bd6279b9fc5fb29e6b826e3e023473f3f82e)
* [merged](https://github.com/TREEcg/event-stream-client/commit/9dbadc4619de38a8876971eb77b8e6fc580c0cd3)
* [Merged with development](https://github.com/TREEcg/event-stream-client/commit/308372487f1af398bbf8af64755e455bd02bcc50)
* [Added test-case to check whether stream ends](https://github.com/TREEcg/event-stream-client/commit/462d8e5b8d30162c74435a2d739cf0687507e83a)
* [Merge branch 'development' into fix-25](https://github.com/TREEcg/event-stream-client/commit/2303f63adebd741d0db9f32ada9156168ffa3ac3)
* [Fixed #25](https://github.com/TREEcg/event-stream-client/commit/b92a93be59ef4ec90520552beb39b5f4d3cc7c6f)

<a name="v2.3.8"></a>
## [v2.3.8](https://github.com/TREEcg/event-stream-client/compare/v2.3.7...v2.3.8) - 2021-09-10

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge branch 'development' into main](https://github.com/TREEcg/event-stream-client/commit/aedb75d7b1c432ea35a8fe62855f84ebab1324dc)
* [Move end event](https://github.com/TREEcg/event-stream-client/commit/d4db082c1af9f94aef07776141a1f60865bfa693)

<a name="v2.3.7"></a>
## [v2.3.7](https://github.com/TREEcg/event-stream-client/compare/v2.3.6...v2.3.7) - 2021-09-09

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge pull request #23 from TREEcg/fix-22](https://github.com/TREEcg/event-stream-client/commit/ca6d57b960454388414d03d689aad03f499b30d9)
* [Update representation interface of Object](https://github.com/TREEcg/event-stream-client/commit/c093a5f21ada7b55299804f2f45bfc84ae0b807b)
* [Add test-case and change output quads to Array<Quad> instead of asynciterator](https://github.com/TREEcg/event-stream-client/commit/3b284dedf57985d35836a4bb3b11771c93b622a3)
* [Allow a representation to be passed and make mimetype optional](https://github.com/TREEcg/event-stream-client/commit/a0e466caad15a346b776f6fb77e460f53e1f5c83)

<a name="v2.3.6"></a>
## [v2.3.6](https://github.com/TREEcg/event-stream-client/compare/v2.3.5...v2.3.6) - 2021-08-26

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Update README.md](https://github.com/TREEcg/event-stream-client/commit/1970e4d4adb786286f1852a6c095b0282f407870)
* [Fix ignoring of pages](https://github.com/TREEcg/event-stream-client/commit/6427bb5701526c771a6b583614052d3b623f7389)
* [Clean up some code](https://github.com/TREEcg/event-stream-client/commit/614915581d362e434ed4dce3beb3b7b7c28a2d67)
* [Fail graciously when a dereferencing a member failed](https://github.com/TREEcg/event-stream-client/commit/d499d5d4aa128db7462d13ffbf67327924a74073)
* [Add link following to member dereferencing](https://github.com/TREEcg/event-stream-client/commit/1a4ed729c8f0dcede1bfab65f9477faf573e1b6b)
* [Merge branch 'main' of github.com:TREEcg/event-stream-client](https://github.com/TREEcg/event-stream-client/commit/03310bc059dd970b3fde07648cfae70afbeabae2)
* [Add optional rate limiting](https://github.com/TREEcg/event-stream-client/commit/8c0e5b8ece4a14a4410d52da8366e4f16428d4de)
* [Wait on the processing of members](https://github.com/TREEcg/event-stream-client/commit/00db84dab4ba923ff35a4327c627fbc725772cb2)
* [Update dependencies](https://github.com/TREEcg/event-stream-client/commit/c4b3bf1f5e19128466d96e2fd38d10e04f11f485)
* [Use polling interval as minimum time between repolling](https://github.com/TREEcg/event-stream-client/commit/89d060b0ff764045009d6ab1de151b8af09d9ba4)
* [Dereference external members](https://github.com/TREEcg/event-stream-client/commit/a32a2defca1f75006aa5442f75fe933e87d47a3f)
* [Add simple content type negotiation](https://github.com/TREEcg/event-stream-client/commit/03784cc860798d465d192dc4f2a11bd6c3bfc979)
* [Add non-cyclic member extraction](https://github.com/TREEcg/event-stream-client/commit/3f8f1a80aca4d8314a3aa8563e948a7778967c73)

<a name="v2.3.5"></a>
## [v2.3.5](https://github.com/TREEcg/event-stream-client/compare/v2.3.4...v2.3.5) - 2021-07-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Print log messages to stderr](https://github.com/TREEcg/event-stream-client/commit/7d931207aeec56dd7dd278025ac13753e9780081)

<a name="v2.3.4"></a>
## [v2.3.4](https://github.com/TREEcg/event-stream-client/compare/v2.3.3...v2.3.4) - 2021-07-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.


<a name="v2.3.3"></a>
## [v2.3.3](https://github.com/TREEcg/event-stream-client/compare/v2.3.2...v2.3.3) - 2021-07-27

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Don't make readonly](https://github.com/TREEcg/event-stream-client/commit/6842e2d34ae0e4c9e3d78144d6600a9809fd81d0)
* [Fix ending too soon when not polling](https://github.com/TREEcg/event-stream-client/commit/5284a9d7c291d2dca916c8c9a2350c909bb71bac)
* [Merge pull request #17 from hdelva/main](https://github.com/TREEcg/event-stream-client/commit/79a54673c4f8b148a7fa2dc7b68c4d7cc79d945b)
* [Fix broken CLI interface](https://github.com/TREEcg/event-stream-client/commit/96b6ff6e3dedf51a6d2cd32dfd99a1f10958f4ca)
* [Add method to ignore certain pages Because they have already been processed for example](https://github.com/TREEcg/event-stream-client/commit/1ca558724f7e298e1fa570b51ec2a493a4417966)
* [Remove recursion](https://github.com/TREEcg/event-stream-client/commit/4b9c489258b2859a7dacb5b003f2edc5134725db)
* [Emit metadata](https://github.com/TREEcg/event-stream-client/commit/a634f4af030ef556c866b379b37ac1a523773823)
* [Make the LRU cache not a singleton](https://github.com/TREEcg/event-stream-client/commit/5abc885df988985bb78a26260fbd99e1be4e0dbc)
* [Make the init actor stateless](https://github.com/TREEcg/event-stream-client/commit/0857fe98ae1aeeddafba8925c7befacbd327fe6e)

<a name="v2.3.2"></a>
## [v2.3.2](https://github.com/TREEcg/event-stream-client/compare/v2.3.1...v2.3.2) - 2021-06-25

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Add actor-rdf-filter-objects-with-quadstore as dependency](https://github.com/TREEcg/event-stream-client/commit/91362fe39753977712b0599340be047320d135be)

<a name="v2.3.1"></a>
## [v2.3.1](https://github.com/TREEcg/event-stream-client/compare/v2.3.0...v2.3.1) - 2021-06-25

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix disablepolling from script](https://github.com/TREEcg/event-stream-client/commit/e4f3500e03b6d3f948c3919c948c869643c15cca)

<a name="v2.3.0"></a>
## [v2.3.0](https://github.com/TREEcg/event-stream-client/compare/v2.2.1...v2.3.0) - 2021-06-25

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Process members async](https://github.com/TREEcg/event-stream-client/commit/e8f94f084944e63cdc581db4f6198c98b2ad7ba9)
* [Don't use priority scale](https://github.com/TREEcg/event-stream-client/commit/037dcc27eb7f6324984c428b8ede83b820773536)
* [Use quadstore instead of framing to filter objects](https://github.com/TREEcg/event-stream-client/commit/adb67f09bd1c7a6f8485f1bd1e7ff090a753cd9e)

<a name="v2.2.1"></a>
## [v2.2.1](https://github.com/TREEcg/event-stream-client/compare/v2.2.0...v2.2.1) - 2021-06-24

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix disablePolling & apply caching when cache-control on private](https://github.com/TREEcg/event-stream-client/commit/ba2a5799dbf102e5001d1555fe1ba988df6341bb)

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/TREEcg/event-stream-client/compare/v2.1.0...v2.2.0) - 2021-06-24

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix #11: use less streams, optimize code](https://github.com/TREEcg/event-stream-client/commit/ef2e7a0e820a7e5f2ca2cdbaa58d07a8825958cb)
* [Update README with other JSON-LD context files](https://github.com/TREEcg/event-stream-client/commit/b030087d4e12a4a185221df9c7a7c81b94063b1f)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/TREEcg/event-stream-client/compare/v2.0.9...v2.1.0) - 2021-06-10

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix #15: add disablePolling parameter](https://github.com/TREEcg/event-stream-client/commit/b2ea6e33649f4669b9282c6273e1bd7c0aaee10d)

<a name="v2.0.9"></a>
## [v2.0.9](https://github.com/TREEcg/event-stream-client/compare/v2.0.8...v2.0.9) - 2021-06-10

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Merge branch 'main' of github.com:TREEcg/event-stream-client into main](https://github.com/TREEcg/event-stream-client/commit/772582bc5a6044a2691094980b23f6ca83570647)
* [Update JSON-LD parser to latest](https://github.com/TREEcg/event-stream-client/commit/8ae302db6c05f6ddbad22264220bb1a1de1e56b2)
* [Merge pull request #14 from nvdk/patch-2](https://github.com/TREEcg/event-stream-client/commit/f0a9f9b58aed34e81916c7a7f07d68c1d7f49de2)
* [small corrections to readme](https://github.com/TREEcg/event-stream-client/commit/aa34ffafd28b73c09fcf0e6ba693c446bcdcef13)

<a name="v2.0.8"></a>
## [v2.0.8](https://github.com/TREEcg/event-stream-client/compare/v2.0.7...v2.0.8) - 2021-05-25

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Update engine-default](https://github.com/TREEcg/event-stream-client/commit/c8828bb0508d066293f7acafac8d14a23d6c735a)
* [Fix now.getTime()](https://github.com/TREEcg/event-stream-client/commit/a287835f5c3205c1a1eb19b4fa0ad3ca7bbd38a0)
* [Fix #9: headers crash](https://github.com/TREEcg/event-stream-client/commit/b511a563530e088b14eccb4e4e27403176c880db)
* [Fix #8 output to stderr](https://github.com/TREEcg/event-stream-client/commit/f2b9a12c6f285d52390cec71e8bacc246319755f)
* [Fix emit member once + <= fromTime](https://github.com/TREEcg/event-stream-client/commit/68fa129e3ddb30c4ff4aa8720eb97f8671e371bd)

<a name="v2.0.7"></a>
## [v2.0.7](https://github.com/TREEcg/event-stream-client/compare/v2.0.6...v2.0.7) - 2021-03-08

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix warnings by renaming URNs in config](https://github.com/TREEcg/event-stream-client/commit/0c0a84545e61f6f9549892647344e10f3fc75e8d)

<a name="v2.0.6"></a>
## [v2.0.6](https://github.com/TREEcg/event-stream-client/compare/v2.0.5...v2.0.6) - 2021-03-08

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Don't use dot notation for req and res](https://github.com/TREEcg/event-stream-client/commit/b97fe7c7845cc881fce36ed1928ea7b6c45263f4)

<a name="v2.0.5"></a>
## [v2.0.5](https://github.com/TREEcg/event-stream-client/compare/v2.0.4...v2.0.5) - 2021-03-08

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Add actor-rdf-filter-object-with-framing as dependency](https://github.com/TREEcg/event-stream-client/commit/3329a8d38f38f452a5a0def9be778af68bf92a72)
* [Change name to @treecg](https://github.com/TREEcg/event-stream-client/commit/bf0cfd55088524611b6fc7cc5c05fef2fc19a93e)

<a name="v2.0.4"></a>
## [v2.0.4](https://github.com/TREEcg/event-stream-client/compare/v2.0.3...v2.0.4) - 2021-03-08

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Update Git URL](https://github.com/TREEcg/event-stream-client/commit/3619bbae2e1664a456681cdaebc085503c117d49)
* [Rename to TREEcg](https://github.com/TREEcg/event-stream-client/commit/23c98a5e4e96bceccff43eace4b17ec8931c3213)
* [Merge branch 'main' of github.com:TREEcg/event-stream-client into main](https://github.com/TREEcg/event-stream-client/commit/5f67b7528a5bcbb0bcf0bf2787c51de29dab9ec8)
* [Change to fromTime](https://github.com/TREEcg/event-stream-client/commit/e7af3b1264fd2a0d83e9f2635c6866be0dafbd95)
* [Merge pull request #1 from brechtvdv/main](https://github.com/TREEcg/event-stream-client/commit/590775762f666978cd49b47bb04df5429dcadeff)

<a name="v2.0.3"></a>
## [v2.0.3](https://github.com/TREEcg/event-stream-client/compare/v2.0.2...v2.0.3) - 2021-03-08

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Rename fromGeneratedAtTime to fromTime](https://github.com/TREEcg/event-stream-client/commit/a00c344c75cc9e2d4a7fcdc2d744c368b8e7e0a6)
* [Don't hard code on prov:generatedAtTime #7](https://github.com/TREEcg/event-stream-client/commit/bde86c90531c76cc2ee47ca2bb762d807009144c)

<a name="v2.0.2"></a>
## [v2.0.2](https://github.com/TREEcg/event-stream-client/compare/v2.0.1...v2.0.2) - 2021-03-05

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Remove unused dependencies](https://github.com/TREEcg/event-stream-client/commit/04cb6af4770dbd1243b5f07e118ddbf657fa65b3)
* [Fix #5 : only emit multiple times when explicitly configured. Fix #6 : latest fragment is automatically refetched every time leading to feching new pages too](https://github.com/TREEcg/event-stream-client/commit/4d39c8456bc6a9fc0296eabf2220e69a4cfa1f91)
* [Fix #7](https://github.com/TREEcg/event-stream-client/commit/3107c7e9d2ca7b37da4da4b60eb9209c76f8445c)
* [Use LRU cache in book keeper](https://github.com/TREEcg/event-stream-client/commit/3d4426ab89d85adc3e6f95cb7cd246439a0064c5)
* [Update to version 2](https://github.com/TREEcg/event-stream-client/commit/003be7c2f7a6ff27fbe3557f0d41a563ed95fb7f)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/TREEcg/event-stream-client/compare/v1.19.1...v2.0.1) - 2021-03-05

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Update lerna to main branch](https://github.com/TREEcg/event-stream-client/commit/4a3d162b0d22791116b10cf89434f1e1c38fd37b)
* [New version with framing](https://github.com/TREEcg/event-stream-client/commit/045dac071b616ee69ce3db1f2ec4f186b6a88f83)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/TREEcg/event-stream-client/compare/v1.19.1...v2.0.0) - 2021-03-05

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [New version with framing](https://github.com/TREEcg/event-stream-client/commit/815e413568d267466bbcf125d0f9a755a6f41693)

<a name="v1.19.1"></a>
## [v1.19.1](https://github.com/TREEcg/event-stream-client/compare/v1.19.0...v1.19.1) - 2021-01-15

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Continue even when fragment gives error](https://github.com/TREEcg/event-stream-client/commit/8778581c4a1af48341fc658cee385727a9bcbdfb)
* [Change bin to run.js](https://github.com/TREEcg/event-stream-client/commit/49ba94d29b06121a6dc2e5afb5717b5204422c63)

<a name="v1.19.0"></a>
## [v1.19.0](https://github.com/TREEcg/event-stream-client/compare/v1.18.7...v1.19.0) - 2021-01-15

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Make true init actor + add pollingInterval parameter to actor](https://github.com/TREEcg/event-stream-client/commit/867ef6257acf69173b713133387ad0cbb2a43e5f)
* [Converting to real init actor](https://github.com/TREEcg/event-stream-client/commit/30e877136a271106c3f3be851bbbb7fb3fed913c)
* [Update readme](https://github.com/TREEcg/event-stream-client/commit/074651839c5a4257f5e2847ab17852fb2735198f)

<a name="v1.18.7"></a>
## [v1.18.7](https://github.com/TREEcg/event-stream-client/compare/v1.18.6...v1.18.7) - 2021-01-13

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Add bin folder](https://github.com/TREEcg/event-stream-client/commit/4a4fee7eb531db45ad213169fc4f0aa12ec180f9)

<a name="v1.18.6"></a>
## [v1.18.6](https://github.com/TREEcg/event-stream-client/compare/v1.18.5...v1.18.6) - 2021-01-13

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Do not compile to dist folder](https://github.com/TREEcg/event-stream-client/commit/398dd437173982134e6d4011aa131146dbadc39f)

<a name="v1.18.5"></a>
## [v1.18.5](https://github.com/TREEcg/event-stream-client/compare/v1.18.4...v1.18.5) - 2021-01-13

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Update readme about publishing](https://github.com/TREEcg/event-stream-client/commit/998b4a686d17381ece7fbaa90e3c50f2a666a81e)
* [Add changelog and remove postinstall in package](https://github.com/TREEcg/event-stream-client/commit/72c253fc89bfa38dcb4fc39b402f7eddad92ffec)

<a name="v1.18.4"></a>
## [v1.18.4](https://github.com/TREEcg/event-stream-client/compare/v1.18.4...v1.18.4) - 2021-01-13

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
