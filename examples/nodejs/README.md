# videogram

## Setup

Requirements:

 * a compatible version of node (current LTS)
 * a `.env` file with credentials to VideoCloud and AWS S3

### Installing Node

Use the dmg to install a compatible [version of node](https://nodejs.org/dist/v6.10.2/node-v6.10.2.pkg).

Next install the node dependencies:

```sh
npm install
```

## Run

```sh
npm start
```

Navigate to [localhost:3000](http://localhost:300/) to see Videogram in action.

## TODOS

 - [ ] create upload elements
 - [ ] Design public API
   - [ ] Single step / multi-step
   - [ ] Setup configuration options
   - [ ] Add hooks for progress, failure, etc
 - [ ] Productionalize:
   - [ ] extract frontend code into separate repo, create npm module
   - [ ] Decide how to embed md5 / sha256 hex algorithms (dependency injection OR part of build script OR optional override)
   - [ ] Setup build script to generate bcuploader code to bundle EvaporateJS & crypto algorithms
   - [ ] Polyfill es6 promises
 - [ ] Test on mobile devices (iphone and android)
