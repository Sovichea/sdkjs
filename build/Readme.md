This document describes the steps needed to build SDK.

For the full development environment setup, see the [fork/develop README](../../fork/develop/README.md).
For a deeper look at the webpack build (benchmarks, dev workflows, caching), see [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md).

1. Required software installation:
	- Download and install nodejs (https://nodejs.org/en/download/).

2. SDK build:
	- npm ci
	- npm run build

3. Additional tasks:
	- `npm run develop` — generates develop scripts (scripts.js) pointing to individual source files (for debugging without compilation)
	- `COMPILED=1 npm run develop` — generates develop scripts pointing to compiled bundles (sdk-all-min.js)
	- `NODE_ENV=development npm run build` — enables source maps, written alongside the compiled bundles and then relocated by the build pipeline
	- `SDK_PLATFORM=desktop|mobile` / `SDK_ADDONS=<path>[:<path>...]` — env vars accepted by both `npm run build` and `npm run develop` to select platform and merge in addon configs
